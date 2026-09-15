# ChemEng Quest — First Day at the Refinery

A short chemical-engineering video game for the AIChE student chapter booth.
Everything runs in the browser with no server, no install and no internet:
open the file and play.

## The two builds

| file | what it is |
| --- | --- |
| `ChemEngQuest.html` | **the game.** The animated build. This is the one to run at the booth. |
| `ChemEngQuest-v1-reference.html` | the earlier, simpler build, kept untouched as a fallback |

Double-click either file. Chrome or Edge is best. Press **F** for full screen.
Click once when the title card appears so the browser lets the sound play.

## Controls

| key | what it does |
| --- | --- |
| arrow keys or WASD | walk |
| space or enter | talk, continue, go through a door |
| mouse | pick up, place and install equipment |
| coffee cup | one hint per station |
| O | walk out of a room and go back to the yard |
| F | full screen |

## How a run goes

1. The AIChE logo assembles, then the main menu.
2. **Choose your engineer.** Four of them. Each is strong in some subjects and
   weak in others, and it changes how the game plays, not just the score:
   * **strong** — they read the situation correctly and the right option is outlined for you
   * **middling** — no help up front, but they work it out after one wrong attempt
   * **weak** — they misread it out loud, suggest the wrong thing with total confidence,
     lose the green target markings, and have to inspect a feed before the game lets them commit
   * **safety** — a careless engineer argues with the PPE locker three times before putting the goggles on

   The fourth card, **Jojo Tarek, the boss's cousin**, is hard mode. He is bad at
   everything, turned up in a floral shirt and sandals, and was hired because of
   his uncle. Picking him changes the game:
   * no coffee hints anywhere
   * no green target bands on the power slider or the cooling duty
   * every feed has to be analysed before you may install anything
   * a completely different opening conversation with the boss, which
     **Bassam** from process safety overhears
   * Bassam then follows you around the yard and blocks the door of each unit
     room with three true/false questions before he will let you out
   * the clients in the reactor lab stop handing over the answer and describe
     their week instead, so you have to infer it
   * steady state has to be held for longer
3. Mr. Tarek gives you the morning.
4. Five stations, in any order:
   * **Separation Techniques Lab** — read five animated feed samples and install the right unit. Wrong units fail in their own way: salt cakes a column solid and splits a seam, a dryer sprays brine over everything, sugar in a reboiler caramelises then carbonises.
   * **Reactor Design Lab** — three clients with a problem each. Ask them questions, then order the reactor, the temperature scheme and the rate on your phone. Wrong type gives purple goo, wrong jacket freezes or ignites it, too high a rate splits it open, too low gives a puff of air.
   * **Piping Circuit Bay** — take the Reynolds sheet, build a line, bolt every flange, fit a relief valve, then pick a pump, a compressor, or a distillation column that will help nobody. Ramp the power into the band and tick the flow regime.
   * **Thermal Exchange Hall** — one skid running away hot, one merely cold. Which you treat first is the safety call. Then walk up to the thermal path analyser standing in the middle of the hall and tag how the heat crosses a furnace gap, a steel wall, a still film and a flowing fluid, before trimming to steady state.
   * **Break Room** — locked until the four units are finished. A colleague, a couch, and a thermodynamics nightmare you will not enjoy.

   Nothing forces you to put a mistake right, and nothing forces you to walk
   away from one either. Every failure offers a second button beside the retry:
   **FIX IT LATER** for an engineer who knows better,
   or **LEAVE IT AS IT IS** in a subject they are weak in, where they genuinely
   believe it is fine. It costs the marks and leaves the equipment running
   wrong with an UNRESOLVED tag on it. Leave two things wrong in the same unit
   and it lets go behind you as you cross the yard: your engineer asks *what
   was that?*, or, if it was their weak subject, decides they are imagining
   things. It stays on the incident board until the verdict.
5. Report back to Mr. Tarek and find out whether you keep the job.
6. Pin your run to **the board** by the office door, if you want it kept.

## Leaving early

A booth queue does not wait, so nothing in the game traps you.

* Every room has a **WALK OUT · O** tab in the top right. It drops you back in
  the yard wherever you happen to be standing, half-built line and all.
* Mr. Tarek waits by his office from the start. Talk to him at any point and he
  will ask whether you really want to clock off with work still open. Say yes
  and he reads the morning back to you exactly as it is — which, with four units
  untouched, goes about as well as you would expect. Jojo gets a different
  reception, on account of being family.
* Nothing is ever a dead end either. Every wrong call can be retried as many
  times as you like — the wrong machine on the pad, a mis-read Reynolds number,
  a mis-tagged heat path, a reactor that came out as purple goo. The only way to
  lose the marks is to choose to leave it.

## The board

**THE BOARD** on the main menu, and the button at the end of a run, open the
cork board outside the office: Mr. Tarek's reports, best score first, with the
name you type on the slip, the engineer you played, the verdict, and whether you
walked off or left anything burning. It is saved in the browser it was played
in, so a booth laptop keeps the day's runs. **CLEAR THE BOARD** wipes it, and
asks twice.

## Scoring

100 points, weighted:

| | weight |
| --- | --- |
| Separation | 20 |
| Reactors | 20 |
| Fluids | 20 |
| Heat | 20 |
| Thermodynamics | 10 |
| Safety | 10 |

In hard mode Bassam's three questions per station are folded into that
station's subject score, so a good engineer who cannot answer them still
loses ground.

Safety points come from PPE, relief valves and treating the dangerous skid first.
They are the smallest slice but they are collected everywhere.

| score | ending |
| --- | --- |
| 98–100 | the boss takes off his own badge and gives it to you |
| 90–97 | Employee of the Day |
| 70–89 | hired, solid position |
| 50–69 | kept on, but you start training on Monday |
| under 50 | a cartoon kick out of the door |

## Running time

About fifteen minutes for someone reading carefully, quicker once they know it.
If the booth queue is long, the easiest things to shorten are in `game/src/`:

* `08-sep.js` — drop entries from `SEP_BAYS` (five samples today)
* `09-rea.js` — drop a client from `REA_CLIENTS` (three today)
* `10-flu.js` — remove the second entry from `FLU_RIGS` to run one line instead of two,
  or shorten `PIPE_SEGS` and `JOINTS` to place fewer pipes and flanges
* `12-brk.js` — drop entries from `DREAM_Q`
* `05-state.js` — `TF_QUIZ` holds Bassam's hard-mode questions, three per station

Rebuild afterwards (see below). Nothing else needs changing; the score
re-weights itself automatically.

## Testing a single station

Add a hash to the URL to jump straight in, which is handy when demonstrating
one part at a booth:

```
ChemEngQuest.html#sep     separation lab
ChemEngQuest.html#rea     reactor lab
ChemEngQuest.html#flu     piping bay
ChemEngQuest.html#hea     thermal hall
ChemEngQuest.html#brk     break room
ChemEngQuest.html#hub     the refinery yard
ChemEngQuest.html#end     the verdict
ChemEngQuest.html#hub,mute   any of the above with the music off
```

Two more, for setting a scene up quickly:

```
ChemEngQuest.html#hea,jojo        play that station as a chosen engineer
                                  (#layla #omar #yusra #jojo)
ChemEngQuest.html#hub,alldone     everything already finished, so the
                                  break room and the verdict are reachable
ChemEngQuest.html#end,quit        the verdict for clocking off early
ChemEngQuest.html#board           the scoreboard
```

## Editing the game

`ChemEngQuest.html` is generated. Edit the parts in `game/src/` and rebuild:

```
node game/build.mjs
```

| file | what is in it |
| --- | --- |
| `00-style.css` | page chrome |
| `01-core.js` | canvas, input, scenes, transitions, particles, drawing helpers |
| `02-audio.js` | the synthesised soundtrack and every sound effect |
| `03-people.js` | the character rig: walk cycles, faces, hair, PPE, speech bubbles |
| `04-fx.js` | dust clouds, steam, fire, frost, water, and all the process equipment |
| `05-state.js` | score, skill behaviour, hints, conversations |
| `06-menus.js` | logo, menu, character select, briefing |
| `07-hub.js` | the refinery yard |
| `08-sep.js` … `12-brk.js` | the five stations |
| `13-end.js` | the verdict |
| `14-board.js` | the cork board and the slip you sign |
| `99-boot.js` | startup |

There are no dependencies and no build tools beyond Node for the concatenation
step. Art, music and sound are all generated in code, so there are no asset
files to lose.
