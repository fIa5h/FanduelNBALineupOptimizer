# Fanduel NBA Lineup Optimizer
___
###### A genetic algorithm that rapidly finds optimal constrained pairings from large datasets
___
This repo allows you to rapidly generate valid high value lineup pairings for FanDuel using a compounding genetic algorithm. In other words, this is gold for the fantasy sports nerds! You're welcome for open sourcing this ;) Report issues on GitHub. Pull requests more than welcome. Trying to contact me directly? Hit me at ryanthomasmusser@gmail.com

Want to see this algorithm in action? Head to my website http://BasketballRoto.com and click the green __Optimize Roster__ button and enjoy the magic.

### Usage directions:
- Enter your npm initialized project directory and install the library by running:
  `npm install --save fanduel_nba_lineup_optimizer`

- In the file you intend to use the library in, import the library like so:
 `const geneticLineupOptimizer = require('fanduel_nba_lineup_optimizer');`

- Initialize the library like so (we'll discuss the params later on):
`var lineupBuilder = geneticLineupOptimizer.spawnEnvironment(cleansedData, generations, evolutions, positions, budget, mutations);`

- Once initialized, if no formatting errors are logged, you can begin to spawn lineups like so:
`var playersToAdd = lineupBuilder.spawnLineup();`

- Then, the `playersToAdd` variable will be false if a lineup could not be produced (and the reason is console.logged), or it will contain an object with a `playersToAdd.fitness` (projected score) property and a `playersToAdd.lineup` property that will contain a grouping of players based on your parameters.

### Parameters:

As discussed above, the library is initialized like so:

`var lineupBuilder = geneticLineupOptimizer.spawnEnvironment(cleansedData, generations, evolutions, positions, budget, mutations);`

Let's discuss each of those parameters in more detail:
___
###### 1) `cleansedData` - **array**
This is an array that contains the player objects the algorithm will be pairing and using as it's _population_ from which it derives lineups. Each of the player objects in the `cleansedData` array MUST contain the following properties:

| Property      | Type       | Definition  |
| ------------- |:----------:| ------------:|
| **id**      | _int_ | A unique identifier. |
| **fanduel_positions**      | _string_   | A single string containing the abbreviated FanDuel position that the player is eligible for, i.e. `'PG'`, `'SG'`, `'SF'`, `'PF'` or `'C'` |
| **fanduel_price** | _int_   | The player's assigned FanDuel price. |
|  **_DFSpoints** | _int_   | The projected total FanDuel points that the player will score. |


___
###### 2) `generations` - **int**
This integer determines how many generations (essentially iterations) each `evolution` will evolve and breed for. The more you include, the longer the process will take, but the higher your odds will be to reach the maximum projected score. I'd suggest starting off with 50. As with `evolutions`, the more `generations` you include will slow your processing time but increase your odds of finding the optimal lineup.
___
###### 3) `evolutions` - **int**
This integer determines the number of times the algorithm will compound. So, for example, let's say you choose 50 `generations` and 4 `evolutions`; the algorithm will evolve 4 different lineups that were each born from 50 iterations. The algorithm will then select the highest lineup of those 4, and return that as the optimal lineup. As with `generations`, the more `evolutions` you include will slow your processing time but increase your odds of finding the optimal lineup.
___
###### 4) `positions` - array
An array containing strings of the abbreviated FanDuel position that you solving for, i.e. `'PG'`, `'SG'`, `'SF'`, `'PF'` or `'C'`. So, for example, let's say you only want to solve for 2 `PG` positions and 2 `SF` positions; your `positions` parameter would look like this: `['PG','PG','SF','SF']`. Or, if you want to solve for 1 `SG` and 2 `PF` positions, your `positions` parameter would look like this: `['SG','PF','PF']`. * **(If you've pre-selected X players, their single positions should not be included in the `positions` array, their cost should be removed from the `budget` and their player objects should be removed from the `cleansedData` array before initialization)**
___
###### 5) `budget` - int
This parameter dictates what budget the algorithm is allowed to spend in optimizing your lineup. So, for example, if you are solving for an entire lineup, your `budget` would be 60,000. Or, if you've selected two players already that cost a total of 12,000, you would pass in a `budget` of 48,000. * **(If you've pre-selected X players, their single positions should not be included in the `positions` array, their cost should be removed from the `budget` and their player objects should be removed from the `cleansedData` array before initialization)**
___
###### 6) `mutations` - int
This determines how many mutations each `generation` will create during the breeding process. Try messing around with this number, but I recommend between 3-5. It greatly increases your odds of returning the optimal lineup, but does reach a point of diminishing returns in regards to speed.  As with `generations`, the more `mutations` you include will slow your processing time but increase your odds of finding the optimal lineup.
___
Want to see this algorithm in action? Head to my website http://BasketballRoto.com and click the green __Optimize Roster__ button and enjoy the magic.

Trying to contact me? Hit me at ryanthomasmusser@gmail.com
