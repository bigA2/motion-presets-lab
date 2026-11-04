# UI mockup motion — recipes

Evidence status: no frame-level measurement of pro ads was possible this run (see README.md). Everything below
is **[R]** our recipe; names (3D tilt, camera push, cursor choreography) are standard industry vocabulary.
Implemented in `presets/src/mockups/`. Params at 30 fps.

| # | id | Move | Params |
|---|---|---|---|
| 1 | landView | 3D tilt that settles flat | rotateX 28→0, rotateY -18→0, scale 0.9→1, 40f, easeOutExpo, perspective 1400 |
| 2 | tiltIdle | slow idle drift after landing | rotateY ±2°, 120f sine |
| 3 | cameraPush | slow dolly toward target | scale 1→1.35 about target point, 90f, easeInOut |
| 4 | cameraPan | pan between two UI regions | translate 90f, easeInOutExpo |
| 5 | pushAndSettle | quick push with overshoot | scale 1→1.12→1.08, 24f |
| 6 | cardFan | cards fan from stack | rot -14/0/+14°, x ±70, 24f, stagger 4, overshoot |
| 7 | cardStack3D | cards stacked in z, spread on cue | z 0/-80/-160 |
| 8 | depthLayers | parallax: bg 0.4x, mid 1x, fg 1.6x of camera move | |
| 9 | parallaxDrift | layers drift opposite directions | ±16px/s |
| 10 | cursorMove | cursor follows bezier path (not straight) | 24–36f, easeInOut, arc offset 12% |
| 11 | cursorClick | cursor press: scale 1→0.85→1 + ring ripple | 8f + 14f ripple |
| 12 | cursorHesitate | cursor slows near target, small overshoot | |
| 13 | uiBuild | elements pop in sequentially (build itself) | stagger 3f, y 16→0, opacity |
| 14 | rowCascade | table rows reveal top→bottom | stagger 2f |
| 15 | chartGrow | bars/line draw on | 30f easeOutExpo, stagger 3f |
| 16 | toggleFlip | switch animates on click | 8f, overshoot |
| 17 | notificationDrop | toast drops from top, bounces | 18f overshoot |
| 18 | floatingLabels | callout chips orbit mockup, bob ±6px | sine 90f |
| 19 | zoomHighlight | dim everything but a region (spotlight) | dim 0.55, 14f |
| 20 | motionBlurTrail | directional blur proportional to speed | blur = 0.04·px/frame |
| 21 | deviceSwap | mockup rotates 180° to reveal second screen | 30f, easeInOutExpo |

Rules [R]: land the mockup before text finishes; every cursor move ends 4–6 frames before the UI reacts; add
soft contact shadow under every tilted card; no linear easing on camera moves.
