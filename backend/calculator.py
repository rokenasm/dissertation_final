"""
calculator.py — Drylining material calculator (Stage 1)

Pure Python. No external dependencies. No API, no UI — just the maths.

All values follow British Gypsum GypWall Single Frame specification A206001:
  https://www.british-gypsum.com/Specification/White-Book-Specification-Selector/
          internal-partitions-walls/gypwall-single-frame/a206001-en

  Boards         : Gyproc WallBoard 12.5mm — 1200 x 2400 mm (2.88 m² per sheet)
                   https://www.british-gypsum.com/products/board-products/gyproc-wallboard-12-5mm

  Studs          : Gypframe 48 S 50 'C' Stud at 300 mm or 600 mm centres
                   Each opening requires 2 extra trimmer studs (one per jamb)
                   https://www.british-gypsum.com/Systems/internal-partitions-walls/gypwall-single-frame

  Tracks         : Gypframe 50 FEC 50 Folded Edge Floor & Ceiling Channel — 3600 mm length
                   Floor track + ceiling track = 2 × wall length
                   https://www.buildingmaterials.co.uk/british-gypsum-gypframe-floor-ceiling-channel-3600mm

  Board screws   : British Gypsum Drywall Screws 25mm (single layer) / 38mm (double layer)
                   Fixed at max 300 mm vertical centres per BG White Book
                   https://www.british-gypsum.com/technical-support/self-help-tools/faqs/
                           what-are-screw-fixing-centres-partitions-ceilings-encasements

  Framing screws : British Gypsum Wafer Head Drywall Screws 13mm — metal-to-metal
                   Fixes Gypframe stud to floor/ceiling channel — 2 per stud
                   https://www.british-gypsum.com/products/fixing-products/
                           british-gypsum-wafer-head-drywall-screws-13mm

  Insulation     : Isover Acoustic Partition Roll APR 1200 — 50 mm thick
                   Pack = 2 rolls × 600 mm wide × 13 m long = 15.6 m² per pack
                   https://www.british-gypsum.com/products/insulation-products/
                           50mm-isover-acoustic-partition-roll-apr-1200

  Joint tape     : Gyproc Joint Tape — 150 m per roll, 50 mm wide (paper tape)
                   Applied to all board-to-board joints (vertical and horizontal)
                   https://www.british-gypsum.com/products/finishing-products/gyproc-joint-tape

  Jointing compound: Gyproc EasiFill 60 — 40 m² coverage per 10 kg bag
                   Applied over joint tape to fill and finish all board joints
                   https://www.british-gypsum.com/products/plaster-products/gyproc-easifill-60
"""

import math
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# British Gypsum constants
# ---------------------------------------------------------------------------

BOARD_WIDTH_MM: int = 1200
BOARD_HEIGHT_MM: int = 2400
BOARD_AREA_M2: float = (BOARD_WIDTH_MM / 1000) * (BOARD_HEIGHT_MM / 1000)  # 2.88 m²

TRACK_LENGTH_M: float = 3.6            # 3600 mm standard Gypframe channel

INSULATION_COVERAGE_M2: float = 15.6   # Isover APR 1200 50mm — per pack

SCREW_VERTICAL_CENTRES_MM: int = 300   # max vertical fixing centres per BG White Book
SCREW_TRACK_CENTRES_MM: int = 600      # horizontal fixing centres along track

FRAMING_SCREWS_PER_STUD: int = 2       # 13mm wafer-head — one at top, one at bottom

JOINT_TAPE_ROLL_M: float = 150.0       # Gyproc Joint Tape — metres per roll
EASIFILL_COVERAGE_M2: float = 40.0     # Gyproc EasiFill 60 — m² per 10 kg bag

VALID_STUD_SPACINGS_MM: tuple = (300, 600)
# 300/600: British Gypsum metal partitions (A206001) and the choices used here
# for timber partitions too.

# Each opening (door, window) needs one trimmer stud each side = 2 extra studs
JAMB_STUDS_PER_OPENING: int = 2


# ---------------------------------------------------------------------------
# Input data structures
# ---------------------------------------------------------------------------

@dataclass
class Opening:
    """A door, window, or other void in a wall."""
    width: float    # metres
    height: float   # metres
    label: str = ""


@dataclass
class WallInput:
    """All inputs describing a single wall run."""
    length: float                               # metres
    height: float                               # metres
    openings: list[Opening] = field(default_factory=list)
    stud_spacing_mm: int = 600                  # 300 or 600
    sides: int = 1                              # 1 (single-sided) or 2 (double-sided)
    layers: int = 1                             # board layers per side
    insulated: bool = False                     # include insulation in estimate
    board_waste_pct: float = 10.0
    stud_waste_pct: float = 5.0
    track_waste_pct: float = 5.0
    insulation_waste_pct: float = 5.0
    screw_waste_pct: float = 10.0
    framing_screw_waste_pct: float = 10.0
    joint_tape_waste_pct: float = 10.0
    easifill_waste_pct: float = 10.0


# ---------------------------------------------------------------------------
# Internal result types (used by individual calc functions only)
# ---------------------------------------------------------------------------

@dataclass
class AreaResult:
    gross_m2: float
    openings_m2: float
    net_m2: float


@dataclass
class BoardResult:
    sheets_required: int


@dataclass
class StudResult:
    stud_count: int
    total_linear_m: float


@dataclass
class TrackResult:
    total_linear_m: float
    pieces_required: int


@dataclass
class InsulationResult:
    packs_required: int


@dataclass
class ScrewsResult:
    total_screws: int


@dataclass
class JointTapeResult:
    rolls: int          # number of 150 m rolls
    tape_m: float       # total metres of tape including waste


# ---------------------------------------------------------------------------
# Customer-facing output types
# ---------------------------------------------------------------------------

@dataclass
class WallEstimate:
    """
    Material takeoff for a single wall run.

    All quantities include waste and are rounded up to whole purchasable units.
    """
    wall_index: int
    length_m: float
    height_m: float
    boarded_area_m2: float    # net wall area (m²) after deducting openings
    boards: int               # sheets of Gyproc WallBoard 12.5mm
    studs_pieces: int         # number of Gypframe C-stud pieces
    studs_linear_m: float     # total linear metres of stud
    track_pieces: int         # number of 3600 mm Gypframe channel lengths
    track_linear_m: float     # total linear metres of track (floor + ceiling)
    insulation_packs: int     # packs of Isover APR 1200 50mm (0 = not insulated)
    screws: int               # British Gypsum Drywall Screws 25mm — board to stud
    framing_screws: int       # British Gypsum Wafer Head Drywall Screws 13mm — stud to track
    joint_tape_rolls: int     # Gyproc Joint Tape 150m rolls
    easifill_bags: int        # Gyproc EasiFill 60 — 10 kg bags


@dataclass
class ProjectTotals:
    """Summed quantities across all wall runs."""
    boards: int
    studs_pieces: int
    studs_linear_m: float
    track_pieces: int
    track_linear_m: float
    insulation_packs: int
    screws: int
    framing_screws: int
    joint_tape_rolls: int
    easifill_bags: int


@dataclass
class ProjectResult:
    walls: list[WallEstimate]
    totals: ProjectTotals


# ---------------------------------------------------------------------------
# Core calculation functions
# ---------------------------------------------------------------------------

def wall_areas(length: float, height: float, openings: list[Opening]) -> AreaResult:
    """
    Calculate gross, openings, and net wall areas.

    Args:
        length:   Wall length in metres.
        height:   Wall height in metres.
        openings: List of Opening objects.

    Returns:
        AreaResult.

    Raises:
        ValueError: If dimensions are invalid or openings exceed the wall area.
    """
    if length <= 0:
        raise ValueError(f"Wall length must be positive, got {length}")
    if height <= 0:
        raise ValueError(f"Wall height must be positive, got {height}")

    gross = round(length * height, 4)

    openings_area = 0.0
    for o in openings:
        if o.width <= 0 or o.height <= 0:
            raise ValueError(f"Opening dimensions must be positive: {o}")
        openings_area += o.width * o.height

    openings_area = round(openings_area, 4)

    if openings_area >= gross:
        raise ValueError(
            f"Openings area ({openings_area} m²) equals or exceeds wall area ({gross} m²)"
        )

    return AreaResult(
        gross_m2=gross,
        openings_m2=openings_area,
        net_m2=round(gross - openings_area, 4),
    )


def board_calc(
    net_area_m2: float,
    sides: int = 1,
    layers: int = 1,
    waste_pct: float = 10.0,
) -> BoardResult:
    """
    Calculate plasterboard sheets required.

    Uses Gyproc WallBoard 1200 × 2400 mm = 2.88 m² per sheet.
    Waste is applied to the sheet count before rounding up.

    Args:
        net_area_m2: Net wall area after deducting openings (m²).
        sides:       1 = single-sided, 2 = both sides boarded.
        layers:      Board layers per side (1 or 2).
        waste_pct:   Waste allowance as a percentage.

    Returns:
        BoardResult.
    """
    if net_area_m2 <= 0:
        raise ValueError(f"Net area must be positive, got {net_area_m2}")
    if sides not in (1, 2):
        raise ValueError(f"Sides must be 1 or 2, got {sides}")
    if layers < 1:
        raise ValueError(f"Layers must be at least 1, got {layers}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    total_boarding_m2 = net_area_m2 * sides * layers
    sheets_net = total_boarding_m2 / BOARD_AREA_M2
    sheets_required = math.ceil(sheets_net * (1 + waste_pct / 100))

    return BoardResult(sheets_required=sheets_required)


def stud_calc(
    length: float,
    height: float,
    stud_spacing_mm: int = 600,
    openings: list[Opening] = None,
    waste_pct: float = 5.0,
) -> StudResult:
    """
    Calculate steel studs required.

    Field studs at spacing intervals:
        count = floor(length_mm / spacing_mm) + 1

    Per opening (door/window): 2 extra trimmer studs are added — one to each
    jamb side. This follows standard BG GypWall framing practice.

    Studs are cut to wall height on site. Total linear metres = pieces × height.
    Waste is applied to the piece count before rounding up.

    Args:
        length:          Wall length in metres.
        height:          Wall height in metres.
        stud_spacing_mm: Stud centres in mm. Must be 300 or 600.
        openings:        List of Opening objects (for jamb stud allowance).
        waste_pct:       Waste allowance as a percentage.

    Returns:
        StudResult.
    """
    if length <= 0:
        raise ValueError(f"Wall length must be positive, got {length}")
    if height <= 0:
        raise ValueError(f"Wall height must be positive, got {height}")
    if stud_spacing_mm not in VALID_STUD_SPACINGS_MM:
        raise ValueError(
            f"Stud spacing must be one of {VALID_STUD_SPACINGS_MM} mm, got {stud_spacing_mm}"
        )
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    if openings is None:
        openings = []

    length_mm = length * 1000
    field_studs = math.floor(length_mm / stud_spacing_mm) + 1
    jamb_studs = JAMB_STUDS_PER_OPENING * len(openings)
    stud_count_net = field_studs + jamb_studs

    stud_count = math.ceil(stud_count_net * (1 + waste_pct / 100))
    total_linear_m = round(stud_count * height, 4)

    return StudResult(
        stud_count=stud_count,
        total_linear_m=total_linear_m,
    )


def track_calc(
    length: float,
    waste_pct: float = 5.0,
) -> TrackResult:
    """
    Calculate steel track (floor + ceiling channel) required.

    Two track runs per wall: floor and ceiling.
    Total linear metres (net) = 2 × wall length.
    Track is supplied in 3600 mm lengths (Gypframe standard).

    Args:
        length:    Wall length in metres.
        waste_pct: Waste allowance as a percentage.

    Returns:
        TrackResult.
    """
    if length <= 0:
        raise ValueError(f"Wall length must be positive, got {length}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    linear_m_with_waste = 2 * length * (1 + waste_pct / 100)
    pieces_required = math.ceil(linear_m_with_waste / TRACK_LENGTH_M)

    return TrackResult(
        total_linear_m=round(linear_m_with_waste, 4),
        pieces_required=pieces_required,
    )


def insulation_calc(
    net_area_m2: float,
    waste_pct: float = 5.0,
) -> InsulationResult:
    """
    Calculate insulation packs required.

    Uses Isover Acoustic Partition Roll APR 1200 — 50 mm thick.
    One pack = 2 rolls × 600 mm wide × 13 m long = 15.6 m².

    Args:
        net_area_m2: Net wall area to insulate (m²).
        waste_pct:   Waste allowance as a percentage.

    Returns:
        InsulationResult.
    """
    if net_area_m2 <= 0:
        raise ValueError(f"Net area must be positive, got {net_area_m2}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    packs_required = math.ceil(
        net_area_m2 * (1 + waste_pct / 100) / INSULATION_COVERAGE_M2
    )

    return InsulationResult(packs_required=packs_required)


def screws_calc(
    length: float,
    height: float,
    stud_spacing_mm: int,
    sides: int = 1,
    layers: int = 1,
    waste_pct: float = 10.0,
) -> ScrewsResult:
    """
    Calculate total drywall screws required.

    Two fixing types counted per BG White Book:

    1. Field fixings (board to stud):
       One screw every 300 mm up the height, at every stud position.
       Multiplied by sides and layers.

    2. Track fixings (board to floor/ceiling track):
       One screw every 600 mm along the length, for floor and ceiling runs.
       Multiplied by sides and layers.

    Args:
        length:          Wall length in metres.
        height:          Wall height in metres.
        stud_spacing_mm: Stud centres in mm (300 or 600).
        sides:           Number of boarded sides (1 or 2).
        layers:          Board layers per side.
        waste_pct:       Waste allowance as a percentage.

    Returns:
        ScrewsResult.
    """
    if stud_spacing_mm not in VALID_STUD_SPACINGS_MM:
        raise ValueError(
            f"Stud spacing must be one of {VALID_STUD_SPACINGS_MM} mm, got {stud_spacing_mm}"
        )

    length_mm = length * 1000
    height_mm = height * 1000

    num_studs = math.floor(length_mm / stud_spacing_mm) + 1
    fixings_per_stud = math.ceil(height_mm / SCREW_VERTICAL_CENTRES_MM)
    field_fixings = num_studs * fixings_per_stud * sides * layers

    fixings_per_track_run = math.ceil(length_mm / SCREW_TRACK_CENTRES_MM)
    track_fixings = 2 * fixings_per_track_run * sides * layers

    total_screws = math.ceil((field_fixings + track_fixings) * (1 + waste_pct / 100))

    return ScrewsResult(total_screws=total_screws)


def framing_screws_calc(
    stud_count: int,
    waste_pct: float = 10.0,
) -> ScrewsResult:
    """
    Calculate British Gypsum Wafer Head Drywall Screws 13mm required.

    These are metal-to-metal fixings that connect each Gypframe stud to the
    floor and ceiling channel. Per BG GypWall Single Frame spec (A206001):
        2 screws per stud — one into floor track, one into ceiling track.

    Args:
        stud_count: Total number of studs to be installed (inc. waste).
        waste_pct:  Waste allowance as a percentage.

    Returns:
        ScrewsResult.
    """
    if stud_count < 1:
        raise ValueError(f"Stud count must be at least 1, got {stud_count}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    total = math.ceil(stud_count * FRAMING_SCREWS_PER_STUD * (1 + waste_pct / 100))
    return ScrewsResult(total_screws=total)


def joint_tape_calc(
    length: float,
    height: float,
    sides: int = 1,
    layers: int = 1,
    waste_pct: float = 10.0,
) -> JointTapeResult:
    """
    Calculate Gyproc Joint Tape rolls required.

    Tape is applied to every board-to-board joint:
      - Vertical joints: occur at every board width (1200 mm) along the wall
            count = ceil(length / 1.2) - 1
            each runs the full wall height
      - Horizontal joints: occur when wall height exceeds one board height (2400 mm)
            count = ceil(height / 2.4) - 1
            each runs the full wall length

    Total tape length is multiplied by sides and layers, waste applied, then
    divided by roll length (150 m) and rounded up.

    Args:
        length:    Wall length in metres.
        height:    Wall height in metres.
        sides:     Number of boarded sides.
        layers:    Board layers per side.
        waste_pct: Waste allowance as a percentage.

    Returns:
        JointTapeResult with rolls and total tape metres (including waste).
    """
    if length <= 0:
        raise ValueError(f"Wall length must be positive, got {length}")
    if height <= 0:
        raise ValueError(f"Wall height must be positive, got {height}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    board_width_m = BOARD_WIDTH_MM / 1000   # 1.2 m
    board_height_m = BOARD_HEIGHT_MM / 1000  # 2.4 m

    vertical_joints = max(0, math.ceil(length / board_width_m) - 1)
    vertical_tape_m = vertical_joints * height

    horizontal_joint_rows = max(0, math.ceil(height / board_height_m) - 1)
    horizontal_tape_m = horizontal_joint_rows * length

    total_tape_m = (vertical_tape_m + horizontal_tape_m) * sides * layers
    tape_with_waste = round(total_tape_m * (1 + waste_pct / 100), 4)

    return JointTapeResult(
        rolls=math.ceil(tape_with_waste / JOINT_TAPE_ROLL_M),
        tape_m=tape_with_waste,
    )


def easifill_calc(
    net_area_m2: float,
    sides: int = 1,
    layers: int = 1,
    waste_pct: float = 10.0,
) -> int:
    """
    Calculate Gyproc EasiFill 60 bags required (10 kg bags).

    EasiFill is applied over joint tape to fill and finish all board joints.
    Coverage per BG product data sheet: 40 m² per 10 kg bag.

    Quantity is based on total boarding area (net × sides × layers) — the
    jointing compound covers the whole boarded face including joints.

    Args:
        net_area_m2: Net wall area after deducting openings (m²).
        sides:       Number of boarded sides.
        layers:      Board layers per side.
        waste_pct:   Waste allowance as a percentage.

    Returns:
        Number of 10 kg bags required.
    """
    if net_area_m2 <= 0:
        raise ValueError(f"Net area must be positive, got {net_area_m2}")
    if waste_pct < 0:
        raise ValueError(f"Waste percentage cannot be negative, got {waste_pct}")

    total_boarding_m2 = net_area_m2 * sides * layers

    return math.ceil(total_boarding_m2 * (1 + waste_pct / 100) / EASIFILL_COVERAGE_M2)


# ---------------------------------------------------------------------------
# Per-wall estimator
# ---------------------------------------------------------------------------

def estimate_wall(wall: WallInput, wall_index: int = 0) -> WallEstimate:
    """
    Run a full material estimate for a single wall run.

    Args:
        wall:       WallInput describing the wall.
        wall_index: Zero-based position in the project (used in reports).

    Returns:
        WallEstimate — flat, customer-facing material quantities.
    """
    areas = wall_areas(wall.length, wall.height, wall.openings)

    boards = board_calc(
        net_area_m2=areas.net_m2,
        sides=wall.sides,
        layers=wall.layers,
        waste_pct=wall.board_waste_pct,
    )

    studs = stud_calc(
        length=wall.length,
        height=wall.height,
        stud_spacing_mm=wall.stud_spacing_mm,
        openings=wall.openings,
        waste_pct=wall.stud_waste_pct,
    )

    tracks = track_calc(
        length=wall.length,
        waste_pct=wall.track_waste_pct,
    )

    insulation_packs = 0
    if wall.insulated:
        insulation_packs = insulation_calc(
            net_area_m2=areas.net_m2,
            waste_pct=wall.insulation_waste_pct,
        ).packs_required

    screws = screws_calc(
        length=wall.length,
        height=wall.height,
        stud_spacing_mm=wall.stud_spacing_mm,
        sides=wall.sides,
        layers=wall.layers,
        waste_pct=wall.screw_waste_pct,
    )

    framing = framing_screws_calc(
        stud_count=studs.stud_count,
        waste_pct=wall.framing_screw_waste_pct,
    )

    tape_rolls = joint_tape_calc(
        length=wall.length,
        height=wall.height,
        sides=wall.sides,
        layers=wall.layers,
        waste_pct=wall.joint_tape_waste_pct,
    )

    easifill_bags = easifill_calc(
        net_area_m2=areas.net_m2,
        sides=wall.sides,
        layers=wall.layers,
        waste_pct=wall.easifill_waste_pct,
    )

    return WallEstimate(
        wall_index=wall_index,
        length_m=wall.length,
        height_m=wall.height,
        boarded_area_m2=areas.net_m2,
        boards=boards.sheets_required,
        studs_pieces=studs.stud_count,
        studs_linear_m=studs.total_linear_m,
        track_pieces=tracks.pieces_required,
        track_linear_m=tracks.total_linear_m,
        insulation_packs=insulation_packs,
        screws=screws.total_screws,
        framing_screws=framing.total_screws,
        joint_tape_rolls=tape_rolls.rolls,
        easifill_bags=easifill_bags,
    )


# ---------------------------------------------------------------------------
# Project-level estimator
# ---------------------------------------------------------------------------

def estimate_project(walls: list[WallInput]) -> ProjectResult:
    """
    Run a full material estimate for a list of wall runs.

    Args:
        walls: List of WallInput objects.

    Returns:
        ProjectResult with per-wall breakdowns and project totals.

    Raises:
        ValueError: If the walls list is empty.
    """
    if not walls:
        raise ValueError("At least one wall must be provided")

    wall_estimates = [
        estimate_wall(wall, wall_index=i)
        for i, wall in enumerate(walls)
    ]

    totals = ProjectTotals(
        boards=sum(w.boards for w in wall_estimates),
        studs_pieces=sum(w.studs_pieces for w in wall_estimates),
        studs_linear_m=round(sum(w.studs_linear_m for w in wall_estimates), 2),
        track_pieces=sum(w.track_pieces for w in wall_estimates),
        track_linear_m=round(sum(w.track_linear_m for w in wall_estimates), 2),
        insulation_packs=sum(w.insulation_packs for w in wall_estimates),
        screws=sum(w.screws for w in wall_estimates),
        framing_screws=sum(w.framing_screws for w in wall_estimates),
        joint_tape_rolls=sum(w.joint_tape_rolls for w in wall_estimates),
        easifill_bags=sum(w.easifill_bags for w in wall_estimates),
    )

    return ProjectResult(walls=wall_estimates, totals=totals)
