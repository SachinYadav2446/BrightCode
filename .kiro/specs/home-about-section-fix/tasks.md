# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Gap & Static About Section Bugs
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists.
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope to concrete failing cases — `.about-section` margin-top and `#about` element type
  - Test 1 (Gap): Parse `Home.css`, find `.about-section` block, assert `margin-top` is NOT >= 100px (from Bug Condition: `isBugCondition` where `marginTop >= 100px`)
  - Test 2 (Static): Parse `Home.jsx`, find `#about` element, assert it is a `motion.div` not a plain `div` (from Bug Condition: `tagName = "div" AND NOT hasFramerMotionProps`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves both bugs exist)
  - Document counterexamples: `.about-section { margin-top: 200px }` and `<div id="about" ...>` (plain div)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-About-Section Behaviors Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: logged-out hero section (`hero-minimal`) renders with existing Framer Motion animations on unfixed code
  - Observe: About section links (Platform, Resources, Legal columns) are present with correct `to` props on unfixed code
  - Observe: About section bottom bar copyright text and tagline display correct content on unfixed code
  - Write property-based tests: for all non-About-section elements, behavior is unchanged (from Preservation Requirements in design)
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for gap bug and static About section bug

  - [x] 3.1 Implement the CSS fix — remove excessive margin-top
    - In `client/src/pages/Home.css`, change `margin-top: 200px` to `margin-top: 0` on `.about-section`
    - _Bug_Condition: isBugCondition(CSSRule) where selector=".about-section" AND marginTop >= 100px_
    - _Expected_Behavior: margin-top <= 40px so no dead space appears above About section_
    - _Preservation: All other CSS rules in Home.css remain unchanged_
    - _Requirements: 2.1_

  - [x] 3.2 Implement the JSX fix — wrap About section with motion.div
    - In `client/src/pages/Home.jsx`, replace `<div id="about" className="about-section">` with `<motion.div id="about" className="about-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={containerVariants}>`
    - Wrap `<div className="about-brand">` with `<motion.div variants={itemVariants}>`
    - Wrap each `<div className="about-column">` with `<motion.div variants={itemVariants}>`
    - Wrap `<div className="about-bottom-bar">` with `<motion.div variants={itemVariants}>`
    - Close the outer `</div>` → `</motion.div>` and all inner wrappers accordingly
    - Reuse existing `containerVariants` and `itemVariants` already defined at top of `Home.jsx`
    - _Bug_Condition: isBugCondition(JSXElement) where id="about" AND tagName="div" AND NOT hasFramerMotionProps_
    - _Expected_Behavior: aboutSection.tagName="motion.div" AND hasWhileInView=true AND childElements.animateWithStagger=true_
    - _Preservation: All other JSX sections (hero, dashboard, heatmap, skill progress, hall of fame, support) remain unchanged_
    - _Requirements: 2.2, 2.3_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Gap Removed & About Section Animated
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms both bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-About-Section Behaviors Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
