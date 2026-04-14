"""
test_calculator.py — Unit tests for the drylining calculator (Stage 1)

Run with:
    pytest tests/

Each test covers a single behaviour and includes a hand-calculated comment
so the logic can be verified in a dissertation viva.
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.calculator import (
    Opening,
    WallInput,
    wall_areas,
    board_calc,
    stud_calc,
    track_calc,
    insulation_calc,
    screws_calc,
    framing_screws_calc,
    joint_tape_calc,
    easifill_calc,
    estimate_wall,
    estimate_project,
    BOARD_AREA_M2,
    INSULATION_COVERAGE_M2,
    JOINT_TAPE_ROLL_M,
    EASIFILL_COVERAGE_M2,
    FRAMING_SCREWS_PER_STUD,
)


# ===========================================================================
# wall_areas
# ===========================================================================

class TestWallAreas:

    def test_plain_wall(self):
        # 4 m × 2.4 m, no openings
        # gross = 4 × 2.4 = 9.6 m²
        result = wall_areas(4.0, 2.4, [])
        assert result.gross_m2 == pytest.approx(9.6)
        assert result.openings_m2 == pytest.approx(0.0)
        assert result.net_m2 == pytest.approx(9.6)

    def test_wall_with_one_door(self):
        # 4 m × 2.4 m wall, one 0.9 × 2.1 m door
        # opening = 0.9 × 2.1 = 1.89 m²
        # net = 9.6 - 1.89 = 7.71 m²
        result = wall_areas(4.0, 2.4, [Opening(0.9, 2.1, "Door")])
        assert result.gross_m2 == pytest.approx(9.6)
        assert result.openings_m2 == pytest.approx(1.89)
        assert result.net_m2 == pytest.approx(7.71)

    def test_wall_with_door_and_window(self):
        # 5 m × 2.4 m wall
        # door 0.9 × 2.1 = 1.89 m², window 1.2 × 1.0 = 1.2 m²
        # gross = 12.0, openings = 3.09, net = 8.91 m²
        result = wall_areas(5.0, 2.4, [Opening(0.9, 2.1), Opening(1.2, 1.0)])
        assert result.gross_m2 == pytest.approx(12.0)
        assert result.openings_m2 == pytest.approx(3.09)
        assert result.net_m2 == pytest.approx(8.91)

    def test_negative_length_raises(self):
        with pytest.raises(ValueError, match="length"):
            wall_areas(-1.0, 2.4, [])

    def test_zero_height_raises(self):
        with pytest.raises(ValueError, match="height"):
            wall_areas(4.0, 0.0, [])

    def test_openings_exceed_wall_raises(self):
        with pytest.raises(ValueError, match="[Oo]pening"):
            wall_areas(4.0, 2.4, [Opening(5.0, 3.0)])

    def test_opening_zero_width_raises(self):
        with pytest.raises(ValueError):
            wall_areas(4.0, 2.4, [Opening(0.0, 2.1)])


# ===========================================================================
# board_calc
# ===========================================================================

class TestBoardCalc:

    def test_single_side_single_layer(self):
        # net = 9.6 m², 1 side, 1 layer, 10% waste
        # sheets_net = 9.6 / 2.88 = 3.333
        # with waste = 3.333 × 1.10 = 3.667 → ceil = 4
        result = board_calc(net_area_m2=9.6, sides=1, layers=1, waste_pct=10.0)
        assert result.sheets_required == 4

    def test_double_sided(self):
        # net = 9.6 m², 2 sides, 1 layer, 10% waste
        # total = 19.2 m², sheets_net = 6.667 → with waste = 7.333 → ceil = 8
        result = board_calc(net_area_m2=9.6, sides=2, layers=1, waste_pct=10.0)
        assert result.sheets_required == 8

    def test_double_layer(self):
        # Same total boarding area as double-sided → same result
        result = board_calc(net_area_m2=9.6, sides=1, layers=2, waste_pct=10.0)
        assert result.sheets_required == 8

    def test_exact_one_sheet_no_waste(self):
        # Exactly 2.88 m² at 0% waste → 1 sheet
        result = board_calc(net_area_m2=BOARD_AREA_M2, sides=1, layers=1, waste_pct=0.0)
        assert result.sheets_required == 1

    def test_fractional_area_rounds_up(self):
        # 2.89 m² — just over one sheet — needs 2 even at 0% waste
        result = board_calc(net_area_m2=2.89, sides=1, layers=1, waste_pct=0.0)
        assert result.sheets_required == 2

    def test_invalid_sides_raises(self):
        with pytest.raises(ValueError, match="[Ss]ides"):
            board_calc(net_area_m2=9.6, sides=3)

    def test_negative_waste_raises(self):
        with pytest.raises(ValueError, match="[Ww]aste"):
            board_calc(net_area_m2=9.6, waste_pct=-5.0)


# ===========================================================================
# stud_calc
# ===========================================================================

class TestStudCalc:

    def test_600mm_spacing_4m_wall_no_openings(self):
        # 4000 mm / 600 mm = 6.67 → floor = 6, +1 = 7 field studs
        # 0 openings → total net = 7
        # with 5% waste → ceil(7 × 1.05) = ceil(7.35) = 8
        result = stud_calc(4.0, 2.4, stud_spacing_mm=600, waste_pct=5.0)
        assert result.stud_count == 8
        assert result.total_linear_m == pytest.approx(8 * 2.4)

    def test_300mm_spacing_4m_wall(self):
        # 4000 / 300 = 13.33 → floor = 13, +1 = 14 field studs, 0 openings
        # with 5% waste → ceil(14 × 1.05) = ceil(14.7) = 15
        result = stud_calc(4.0, 2.4, stud_spacing_mm=300, waste_pct=5.0)
        assert result.stud_count == 15

    def test_jamb_studs_added_for_each_opening(self):
        # 4 m wall, 600 mm spacing, 1 door → 7 field + 2 jamb = 9 net
        # with 5% waste → ceil(9 × 1.05) = ceil(9.45) = 10
        door = Opening(0.9, 2.1)
        result = stud_calc(4.0, 2.4, stud_spacing_mm=600, openings=[door], waste_pct=5.0)
        assert result.stud_count == 10

    def test_two_openings_adds_four_jamb_studs(self):
        # 4 m wall, 600 mm, 2 openings → 7 field + 4 jamb = 11 net
        # with 0% waste → 11
        openings = [Opening(0.9, 2.1), Opening(1.2, 1.0)]
        result = stud_calc(4.0, 2.4, stud_spacing_mm=600, openings=openings, waste_pct=0.0)
        assert result.stud_count == 11

    def test_exact_spacing_multiple(self):
        # 3600 mm / 600 mm = 6 exactly → 6 + 1 = 7, 0% waste → 7
        result = stud_calc(3.6, 2.4, stud_spacing_mm=600, waste_pct=0.0)
        assert result.stud_count == 7

    def test_invalid_spacing_raises(self):
        with pytest.raises(ValueError, match="[Ss]pacing"):
            stud_calc(4.0, 2.4, stud_spacing_mm=400)

    def test_negative_length_raises(self):
        with pytest.raises(ValueError, match="length"):
            stud_calc(-1.0, 2.4, stud_spacing_mm=600)


# ===========================================================================
# track_calc
# ===========================================================================

class TestTrackCalc:

    def test_4m_wall(self):
        # Net linear = 2 × 4 = 8 m
        # with 5% waste = 8.4 m
        # pieces = ceil(8.4 / 3.6) = ceil(2.333) = 3
        result = track_calc(length=4.0, waste_pct=5.0)
        assert result.total_linear_m == pytest.approx(8.4)
        assert result.pieces_required == 3

    def test_exact_multiple_of_track_length(self):
        # 3.6 m wall → 7.2 m net, 0% waste → pieces = ceil(7.2 / 3.6) = 2
        result = track_calc(length=3.6, waste_pct=0.0)
        assert result.total_linear_m == pytest.approx(7.2)
        assert result.pieces_required == 2

    def test_short_wall_one_piece_covers_both_runs(self):
        # 1 m wall → 2 m net, 0% waste → ceil(2 / 3.6) = 1 piece
        result = track_calc(length=1.0, waste_pct=0.0)
        assert result.pieces_required == 1

    def test_zero_length_raises(self):
        with pytest.raises(ValueError, match="length"):
            track_calc(length=0.0)


# ===========================================================================
# insulation_calc
# ===========================================================================

class TestInsulationCalc:

    def test_small_area_one_pack(self):
        # 7.71 m² × 1.05 = 8.1 m² → ceil(8.1 / 15.6) = 1
        result = insulation_calc(net_area_m2=7.71, waste_pct=5.0)
        assert result.packs_required == 1

    def test_exact_one_pack_at_zero_waste(self):
        result = insulation_calc(net_area_m2=INSULATION_COVERAGE_M2, waste_pct=0.0)
        assert result.packs_required == 1

    def test_just_over_one_pack_needs_two(self):
        result = insulation_calc(net_area_m2=15.601, waste_pct=0.0)
        assert result.packs_required == 2

    def test_large_area(self):
        # 50 m² × 1.05 = 52.5 → ceil(52.5 / 15.6) = ceil(3.365) = 4
        result = insulation_calc(net_area_m2=50.0, waste_pct=5.0)
        assert result.packs_required == 4

    def test_zero_area_raises(self):
        with pytest.raises(ValueError, match="area"):
            insulation_calc(net_area_m2=0.0)


# ===========================================================================
# screws_calc
# ===========================================================================

class TestScrewsCalc:

    def test_600mm_studs_single_side(self):
        # 4 m × 2.4 m, 600 mm studs, 1 side, 1 layer, 10% waste
        #
        # Field: num_studs = floor(4000/600)+1 = 7
        #        fixings_per_stud = ceil(2400/300) = 8
        #        field = 7 × 8 = 56
        #
        # Track: fixings_per_run = ceil(4000/600) = 7
        #        track = 2 × 7 = 14
        #
        # total_net = 70 → with 10% waste → ceil(77.0) = 77
        result = screws_calc(4.0, 2.4, stud_spacing_mm=600, sides=1, layers=1, waste_pct=10.0)
        assert result.total_screws == 77

    def test_300mm_spacing_gives_more_screws(self):
        result_300 = screws_calc(4.0, 2.4, stud_spacing_mm=300, waste_pct=0.0)
        result_600 = screws_calc(4.0, 2.4, stud_spacing_mm=600, waste_pct=0.0)
        assert result_300.total_screws > result_600.total_screws

    def test_double_sided_doubles_screws(self):
        single = screws_calc(4.0, 2.4, stud_spacing_mm=600, sides=1, waste_pct=0.0)
        double = screws_calc(4.0, 2.4, stud_spacing_mm=600, sides=2, waste_pct=0.0)
        assert double.total_screws == single.total_screws * 2

    def test_double_layer_doubles_screws(self):
        one = screws_calc(4.0, 2.4, stud_spacing_mm=600, layers=1, waste_pct=0.0)
        two = screws_calc(4.0, 2.4, stud_spacing_mm=600, layers=2, waste_pct=0.0)
        assert two.total_screws == one.total_screws * 2

    def test_invalid_spacing_raises(self):
        with pytest.raises(ValueError, match="[Ss]pacing"):
            screws_calc(4.0, 2.4, stud_spacing_mm=450)


# ===========================================================================
# framing_screws_calc
# ===========================================================================

class TestFramingScrewsCalc:

    def test_basic(self):
        # 8 studs, 2 per stud = 16 net, 10% waste → ceil(17.6) = 18
        result = framing_screws_calc(stud_count=8, waste_pct=10.0)
        assert result.total_screws == 18

    def test_zero_waste(self):
        # 7 studs × 2 = 14
        result = framing_screws_calc(stud_count=7, waste_pct=0.0)
        assert result.total_screws == 7 * FRAMING_SCREWS_PER_STUD

    def test_more_studs_more_screws(self):
        small = framing_screws_calc(stud_count=5, waste_pct=0.0)
        large = framing_screws_calc(stud_count=10, waste_pct=0.0)
        assert large.total_screws > small.total_screws

    def test_invalid_stud_count_raises(self):
        with pytest.raises(ValueError):
            framing_screws_calc(stud_count=0)


# ===========================================================================
# joint_tape_calc
# ===========================================================================

class TestJointTapeCalc:

    def test_4m_wall_standard_height(self):
        # 4 m × 2.4 m, boards 1200mm wide → ceil(4.0/1.2) = 4 columns → 3 vertical joints
        # vertical tape = 3 × 2.4 = 7.2 m
        # horizontal joints: ceil(2.4/2.4) - 1 = 0
        # total net = 7.2 m, 10% waste = 7.92 m → ceil(7.92/150) = 1 roll
        result = joint_tape_calc(4.0, 2.4, sides=1, layers=1, waste_pct=10.0)
        assert result.rolls == 1
        assert result.tape_m == pytest.approx(7.2 * 1.10, rel=1e-3)

    def test_wall_taller_than_one_board_adds_horizontal_joints(self):
        # 4 m × 3.0 m → vertical joints = 3 (same), horizontal joint rows = 1
        # vertical tape = 3 × 3.0 = 9.0 m
        # horizontal tape = 1 × 4.0 = 4.0 m
        # total net = 13.0 m, 0% waste → 1 roll
        result = joint_tape_calc(4.0, 3.0, sides=1, layers=1, waste_pct=0.0)
        assert result.tape_m == pytest.approx(13.0)
        assert result.rolls == 1

    def test_double_sided_doubles_tape(self):
        single = joint_tape_calc(4.0, 2.4, sides=1, waste_pct=0.0)
        double = joint_tape_calc(4.0, 2.4, sides=2, waste_pct=0.0)
        assert double.tape_m == pytest.approx(single.tape_m * 2)

    def test_wall_exact_one_board_wide_has_no_joints(self):
        # 1.2 m wide wall → ceil(1.2/1.2) = 1 column → 0 vertical joints
        # 2.4 m high → 0 horizontal joints
        # total = 0 m → 0 rolls
        result = joint_tape_calc(1.2, 2.4, sides=1, waste_pct=0.0)
        assert result.tape_m == pytest.approx(0.0)
        assert result.rolls == 0

    def test_zero_length_raises(self):
        with pytest.raises(ValueError, match="length"):
            joint_tape_calc(0.0, 2.4)


# ===========================================================================
# easifill_calc
# ===========================================================================

class TestEasifillCalc:

    def test_small_wall_one_bag(self):
        # net = 9.6 m², 1 side, 1 layer, 10% waste
        # total boarding = 9.6 m², with waste = 10.56 m²
        # bags = ceil(10.56 / 40) = 1
        assert easifill_calc(net_area_m2=9.6, sides=1, layers=1, waste_pct=10.0) == 1

    def test_exact_coverage_no_waste(self):
        # Exactly 40 m² at 0% waste → 1 bag
        assert easifill_calc(net_area_m2=EASIFILL_COVERAGE_M2, sides=1, layers=1, waste_pct=0.0) == 1

    def test_just_over_one_bag_needs_two(self):
        assert easifill_calc(net_area_m2=40.01, sides=1, layers=1, waste_pct=0.0) == 2

    def test_double_sided_needs_more_bags(self):
        # 25 m² single = 25 m² total → 1 bag; double = 50 m² total → 2 bags
        single = easifill_calc(net_area_m2=25.0, sides=1, layers=1, waste_pct=0.0)
        double = easifill_calc(net_area_m2=25.0, sides=2, layers=1, waste_pct=0.0)
        assert double > single

    def test_zero_area_raises(self):
        with pytest.raises(ValueError, match="area"):
            easifill_calc(net_area_m2=0.0)


# ===========================================================================
# estimate_wall (integration)
# ===========================================================================

class TestEstimateWall:

    def test_returns_flat_fields(self):
        wall = WallInput(length=4.0, height=2.4, stud_spacing_mm=600)
        result = estimate_wall(wall, wall_index=0)

        assert result.wall_index == 0
        assert result.length_m == 4.0
        assert result.height_m == 2.4
        assert result.boarded_area_m2 == pytest.approx(9.6)
        assert isinstance(result.boards, int)
        assert isinstance(result.studs_pieces, int)
        assert isinstance(result.studs_linear_m, float)
        assert isinstance(result.track_pieces, int)
        assert isinstance(result.track_linear_m, float)
        assert isinstance(result.insulation_packs, int)
        assert isinstance(result.screws, int)
        assert isinstance(result.framing_screws, int)
        assert isinstance(result.joint_tape_rolls, int)
        assert isinstance(result.easifill_bags, int)

    def test_framing_screws_greater_than_zero(self):
        wall = WallInput(length=4.0, height=2.4)
        result = estimate_wall(wall)
        assert result.framing_screws > 0

    def test_easifill_bags_greater_than_zero(self):
        wall = WallInput(length=4.0, height=2.4)
        result = estimate_wall(wall)
        assert result.easifill_bags > 0

    def test_not_insulated_returns_zero_packs(self):
        wall = WallInput(length=4.0, height=2.4, insulated=False)
        result = estimate_wall(wall)
        assert result.insulation_packs == 0

    def test_insulated_wall_returns_nonzero_packs(self):
        wall = WallInput(length=4.0, height=2.4, insulated=True)
        result = estimate_wall(wall)
        assert result.insulation_packs >= 1

    def test_opening_reduces_boarded_area(self):
        plain = WallInput(length=4.0, height=2.4)
        with_door = WallInput(length=4.0, height=2.4, openings=[Opening(0.9, 2.1)])
        assert estimate_wall(with_door).boarded_area_m2 < estimate_wall(plain).boarded_area_m2

    def test_opening_adds_jamb_studs(self):
        plain = WallInput(length=4.0, height=2.4)
        with_door = WallInput(length=4.0, height=2.4, openings=[Opening(0.9, 2.1)])
        # Wall with a door needs more studs (jamb trimers) than plain wall
        assert estimate_wall(with_door).studs_pieces > estimate_wall(plain).studs_pieces


# ===========================================================================
# estimate_project (integration)
# ===========================================================================

class TestEstimateProject:

    def test_single_wall_totals_match_wall(self):
        walls = [WallInput(length=4.0, height=2.4)]
        result = estimate_project(walls)

        assert result.totals.boards == result.walls[0].boards
        assert result.totals.studs_pieces == result.walls[0].studs_pieces
        assert result.totals.screws == result.walls[0].screws
        assert result.totals.framing_screws == result.walls[0].framing_screws
        assert result.totals.joint_tape_rolls == result.walls[0].joint_tape_rolls
        assert result.totals.easifill_bags == result.walls[0].easifill_bags

    def test_two_wall_totals_are_summed(self):
        walls = [WallInput(length=4.0, height=2.4), WallInput(length=3.0, height=2.4)]
        result = estimate_project(walls)
        assert result.totals.boards == result.walls[0].boards + result.walls[1].boards

    def test_insulation_only_counted_for_insulated_walls(self):
        walls = [
            WallInput(length=4.0, height=2.4, insulated=True),
            WallInput(length=3.0, height=2.4, insulated=False),
        ]
        result = estimate_project(walls)
        assert result.walls[1].insulation_packs == 0
        assert result.totals.insulation_packs == result.walls[0].insulation_packs

    def test_empty_list_raises(self):
        with pytest.raises(ValueError, match="[Ww]all"):
            estimate_project([])

    def test_wall_indices_are_sequential(self):
        walls = [WallInput(length=i + 1.0, height=2.4) for i in range(3)]
        result = estimate_project(walls)
        for i, w in enumerate(result.walls):
            assert w.wall_index == i
