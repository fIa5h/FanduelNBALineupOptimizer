// Ryan Musser
// http://RyanMusser.com
'use strict';
// Genetic Algorithm vs. FanDuel Lineup Optimization

module.exports = {

  spawnEnvironment: function(population,generations,evolutions,positions,budget,mutations){
  //
  //population (array) == player list
  //
  //generations (int) == how many iterations per evolution?
  //
  //evolutions (int) == how many evolutionary iterations to produce before returning the optimal found lineup
  //
  //positions (array) == possible positions
  //
  //budget (int) == maximum spend
  //
  //mutation (int) == how many positions will we mutate in each generations
  //

  //
  //set in setTwoFittestChildren
  var highScore = 0;
  //
  //set in ???
  var currentGenerationCount = 0;
  var currentGeneration = [];
  //
  //an array of the current two parents
  //set in setTwoFittestChildren
  var fittestChildren = [];
  //
  var populationLength = population.length;
  var rosterLength = positions.length;
  //
  //this is set below in the for loop
  var playersSortedByPosition = {};
  var uniquePlayerIds = [];
  //
  //
  /*
  Now we're going to check our params to ensure we're
  creating a valid instance of this function/closure
  */
  if(population.length < 20){
    console.log('Please pass in atleast 20 players in "population"!');
    return false;
  }

  if(parseInt(generations) < 1){
    console.log('Please specify a "generations" greater than 0!');
    return false;
  }

  if( (parseInt(budget)/positions.length) < 3500){
    console.log('Please specify a "budget" with greater than $3499 per player!');
    return false;
  }
  //
  //
  /*
  Next, before we allow the initialization process to continue, we comb through
  each player to ensure that they're formatted properly and then we organize them
  into positions
  */
  //
  for(var iterator = populationLength-1; iterator >= 0; iterator--){

    var position = population[iterator].fanduel_positions;

    if(population[iterator].id === undefined || uniquePlayerIds.indexOf(population[iterator].id) > -1){
      console.log("The following player has an 'id' node that is the same as another player or is undefined. Player 'id' must be unique...");
      console.log(population[iterator]);
      return false;
    }
    uniquePlayerIds.push(population[iterator].id);

    if(position === undefined || positions.indexOf(position) < 0){
      console.log("The following player doesn't have a properly formatted 'fanduel_positions' node...");
      console.log(population[iterator]);
      return false;
    }

    if(population[iterator].fanduel_price === undefined || population[iterator].fanduel_price < 3500){
      console.log("The following player doesn't have a 'fanduel_price' node greater than the FanDuel minimum of $3500...");
      console.log(population[iterator]);
      return false;
    }

    if(playersSortedByPosition[position] == undefined){
      playersSortedByPosition[position] = [population[iterator]];
    }else{
      playersSortedByPosition[position].push(population[iterator]);
    }
  }
  //
  var evolutionaryHoldOver = [];
  //

  return {
        //
        spawnLineup: function(){

          if(evolutions == 1){
            highScore = 0;
            currentGenerationCount = 0;
            currentGeneration = [];
            fittestChildren = [];
            if(!this.spawnInitialGeneration()){
              console.log("I can't return a lineup...");
              return false;
            }
            return this.returnHighestScoringLineup();
          }else if(evolutions > 1){
            evolutionaryHoldOver = [];
            for(var iterator = evolutions; iterator > 0; iterator--){
              if(!this.spawnInitialGeneration()){
                console.log("I can't return a lineup...");
                return false;
              }
              this.spawnNewEvolutionaryProcess();
            }
            return this.returnHighestScoringLineup();
          }else{
            console.log('Please specify how many evolutions you want to execute and pull from!');
          }
        },
        //
        spawnNewEvolutionaryProcess: function(){

          evolutionaryHoldOver.push(fittestChildren[0]);

          highScore = 0;
          currentGenerationCount = 0;
          currentGeneration = [];
          fittestChildren = [];

        },
        //
        spawnInitialGeneration: function ()  {
          //generate 200 lineups to create our initial population
          for(var iterator = 200; iterator > 0; iterator--){
            currentGeneration.push(this.generateRandomLineup());
          }
          //
          for(var iterator = generations; iterator > 0; iterator--){
            if(!this.proceedToNextGeneration()){
              console.log("I couldn't spawn an initial generation...");
              return false;
            }
          }

          return true;

        },
        //
        generateRandomLineup: function(){
          var child = {};
          child.lineup = [];
          child.fitness = 0;
          for(var iterator = rosterLength-1; iterator >= 0; iterator--){
            var thisPosition = positions[iterator];
            var randomnumber = Math.floor(Math.random() * (playersSortedByPosition[thisPosition].length));
            child.lineup.push(playersSortedByPosition[thisPosition][randomnumber]);
          }
          child.fitness = this.calculateFitness(child.lineup);
          if(child.fitness > highScore){
            highScore = child.fitness;
          }
          return child;
        },
        //
        generateRandomPlayer: function(position){
          var randomnumber = Math.floor(Math.random() * (playersSortedByPosition[position].length));
          return playersSortedByPosition[position][randomnumber];
        },
        //
        calculateFitness: function (lineup)  {
          if(lineup.length == 0 || lineup === undefined){
            return 0;
          }
          //
          //
          //does lineup meet budget criteria?
          var cost = 0;
          lineup.map(function(player){
            cost += player.fanduel_price;
          });
          if(cost > budget){
            //cost is greater than the budget, fitness is 0
            return 0;
          }
          //
          //
          //does lineup meet positional criteria?
          var thesePositions = [];
          lineup.map(function(player){
            thesePositions.push(player.fanduel_positions);
          });
          if(positions.sort().join() != thesePositions.sort().join()){
            //the positions are invalid, fitness of this lineup is 0
            return 0;
          }
          //
          //
          //do we have multiples of the same player?
          var thesePlayerIds = [];
          var duplicatePlayer = false;
          //
          lineup.map(function(player){
            if(thesePlayerIds.indexOf(player.id) > -1){
              duplicatePlayer = true;
            }else{
              thesePlayerIds.push(player.id);
            }
          });
          //
          if(duplicatePlayer){
            //duplicate players, fitness of this lineup is 0
            return 0;
          }
          //
          //
          //calculate projected points
          var fitness = 0;
          lineup.map(function(player){
            fitness += parseFloat(player._DFSpoints);
          });
          return fitness;
        },
        //
        setTwoFittestChildren: function ()  {
          //set the two fittest children in fittestChildren
          var thisGenerationHighScore = 0;
          var thisGenerationFittestChild;
          var thisGenerationSecondHighScore = 0;
          var thisGenerationSecondFittestChild;
          //
          currentGeneration.map(function(lineup){
            //
            if(lineup.fitness > thisGenerationHighScore){
              //dethrone fittest child
              thisGenerationSecondFittestChild = thisGenerationFittestChild;
              thisGenerationSecondHighScore = thisGenerationHighScore;
              //rethrone fittest child
              thisGenerationFittestChild = lineup;
              thisGenerationHighScore = lineup.fitness;
              //
            }else if(lineup.fitness > thisGenerationSecondHighScore && lineup.fitness != thisGenerationHighScore){
              //we make sure the lineup is different then we
              //dethrone and rethrone the secondFittestChild
              thisGenerationSecondFittestChild = lineup;
              thisGenerationSecondHighScore = lineup.fitness;
              //
            }
            //
          });
          //
          //
          //assume the new fitness of the current generation
          highScore = thisGenerationHighScore;

          if(thisGenerationFittestChild === undefined || thisGenerationSecondFittestChild == undefined){
            console.log('Your parameters are to strict to create a breeding population! Your evolutionary process is going to die!');
            return false;
          }

          fittestChildren[0] = thisGenerationFittestChild;
          fittestChildren[0].lineup = this.sortLineup(thisGenerationFittestChild.lineup);

          fittestChildren[1] = thisGenerationSecondFittestChild;
          fittestChildren[1].lineup = this.sortLineup(thisGenerationSecondFittestChild.lineup);

          return true;
          //
        },
        //
        sortLineup: function(lineup){
          var sortedLineup = [];
          var playerIds = [];
          positions.map(function(position,index){
            var positionTaken = false;
            lineup.map(function(player){
              if( player.fanduel_positions.trim() == position.trim() && playerIds.indexOf(player.id) == -1 && !positionTaken){
                playerIds.push(player.id);
                sortedLineup[index] = player;
                positionTaken = true;
              }
            });
          });
          return sortedLineup;
        },
        //
        mateChildren: function ()  {
          //we will mate the two fittest children to create
          //18 lineups - each child will have a index of it's positions
          //filled with the player in that position from the other child
          // also, we will introduce 18 mutated lineups and 36 new random new lineups, which
          // in this scenario is our instance of mutation
          //9 lineups
          var firstChildSpawn = [];
          //9 lineups
          var secondChildSpawn = [];
          //
          //18 mutations
          //9 mutations of the first child
          var mutatedNewFirstChild = [];
          var firstChildMutationContainer = [];
          //9 mutations of the second child
          var mutatedNewSecondChild = [];
          var secondChildMutationContainer = [];
          //18 completely new mutations
          var completelyRandomMutations = [];

          //mate the first child with the second
          for(var iterator = 0; iterator < rosterLength; iterator++){
            var thisChild = {};
            thisChild.lineup = fittestChildren[0].lineup.slice();
            thisChild.lineup[iterator] = fittestChildren[1].lineup[iterator];
            thisChild.fitness = this.calculateFitness(thisChild.lineup);
            firstChildSpawn[iterator] = thisChild;
          }

          //mate the second child with the first
          for(var iterator = 0; iterator < rosterLength; iterator++){
            var thisChild = {};
            thisChild.lineup = fittestChildren[1].lineup.slice();
            thisChild.lineup[iterator] = fittestChildren[0].lineup[iterator];
            thisChild.fitness = this.calculateFitness(thisChild.lineup);
            secondChildSpawn[iterator] = thisChild;
          }

          /*
          //THIS SHOULD BE ABSTRACTED INTO A mutateLineup FUNCTION
          */
          //create a mutated set of of the new first child
          for(var mutationIterator = 0; mutationIterator < mutations; mutationIterator++){
            for(var iterator = 0; iterator < rosterLength; iterator++){
              var thisChild = {};
              thisChild.lineup = firstChildSpawn[iterator].lineup.slice();
              //
              thisChild.lineup[iterator] = this.mutatePlayer(thisChild.lineup[iterator]);
              //
              thisChild.fitness = this.calculateFitness(thisChild.lineup);
              //
              mutatedNewFirstChild[iterator] = thisChild;
            }
            firstChildMutationContainer.push(mutatedNewFirstChild);
          }

          /*
          //THIS SHOULD BE ABSTRACTED INTO A mutateLineup FUNCTION
          */
          //create a mutated set of of the new second child
          for(var mutationIterator = 0; mutationIterator < mutations; mutationIterator++){
            for(var iterator = 0; iterator < rosterLength; iterator++){
              var thisChild = {};
              thisChild.lineup = secondChildSpawn[iterator].lineup.slice();
              //
              thisChild.lineup[iterator] = this.mutatePlayer(thisChild.lineup[iterator]);
              //
              thisChild.fitness = this.calculateFitness(thisChild.lineup);
              //
              mutatedNewSecondChild[iterator] = thisChild;
            }
            secondChildMutationContainer.push(mutatedNewSecondChild);
          }

          for(var iterator = 18; iterator > 0; iterator--){
            completelyRandomMutations.push(this.generateRandomLineup());
          }

          currentGeneration = firstChildSpawn.concat(secondChildSpawn,mutatedNewFirstChild,mutatedNewSecondChild,completelyRandomMutations);

          return;
        },
        //
        //
        mutatePlayer: function(player) {
            //we will try a maximum of 20 times to find a player with
            //higher projected DFS points than our current player
            //
            /*
            TODO
            SEARCH FOR HIGHER VALUE PLAYER INSTEAD OF HIGHER POINTS PLAYER
            */
            //
            var currentDFSValue = parseFloat(player._DFSpoints)/parseInt(player.fanduel_price);
            var iterator = 30;
            var foundHigherScore = false;
            var randomPlayer;
            while(iterator >= 0 && !foundHigherScore){
              randomPlayer = this.generateRandomPlayer(player.fanduel_positions);
              var randomPlayerDFSValue = parseFloat(randomPlayer._DFSpoints)/parseInt(randomPlayer.fanduel_price);
              if(randomPlayerDFSValue > currentDFSValue){
                player = randomPlayer;
                foundHigherScore = true;
                iterator = -1;
              }
              iterator--;
            }
            //
            if(!foundHigherScore){
              player = randomPlayer;
            }
            //
            return player;
        },
        //
        proceedToNextGeneration: function ()  {
          //let's pick our most eligible mating pair from
          //the current generations
          //
          if(!this.setTwoFittestChildren()){
            console.log("I couldn't find two fit children to breed...");
            return false;
          }
          //
          //let's mate those two
          this.mateChildren();
          //
          //and voila - we've spawned a new,
          //and more than likely, fitter, generation
          //
          return true;
        },
        //
        logHighScore: function(){
          //
          console.log('High score: '+highScore);
          //
          return;
        },
        //
        returnHighScore: function(){
          //
          if(evolutionaryHoldOver.length > 0){
            //we're executing multiple evolutions
            //so we need to choose the most fit lineup
            var thisEvolutionaryHoldOverFittestChild;
            var thisEvolutionaryHoldOverHighScore = 0;
            //
            evolutionaryHoldOver.map(function(lineup){
              //
              if(lineup.fitness > thisEvolutionaryHoldOverHighScore){
                //rethrone fittest child
                thisEvolutionaryHoldOverFittestChild = lineup;
                thisEvolutionaryHoldOverHighScore = lineup.fitness;
                //
              }
            //
            });
            //
            return thisEvolutionaryHoldOverFittestChild.fitness;
            //
          }else{
            return highScore;
          }
          //
        },
        //
        logFittestChildren: function(){
          console.log(fittestChildren);
          fittestChildren.map(function(node){
            var playerLogString = '';
            node.lineup.map(function(player){
              playerLogString += ' '+player.first_name+' '+player.last_name;
            });
            console.log(playerLogString);
            console.log('***********');
          });
        },
        //
        returnHighestScoringLineup: function(){
          if(evolutionaryHoldOver.length > 0){
            //we're executing multiple evolutions
            //so we need to choose the most fit lineup
            var thisEvolutionaryHoldOverFittestChild;
            var thisEvolutionaryHoldOverHighScore = 0;
            //
            evolutionaryHoldOver.map(function(lineup){
              //
              if(lineup.fitness > thisEvolutionaryHoldOverHighScore){
                //rethrone fittest child
                thisEvolutionaryHoldOverFittestChild = lineup;
                thisEvolutionaryHoldOverHighScore = lineup.fitness;
                //
              }
            //
            });
            //
            return thisEvolutionaryHoldOverFittestChild;
            //
          }else{
            return fittestChildren[0];
          }
        },
        //
    };//end of return

  },//end of spawnEnvironment

}//end of module.export
