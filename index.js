const googleTrends = require('google-trends-api'),
	  correlation = require('./node_modules/correlation-rank/dist/index.js');
 

googleTrends.interestOverTime({keyword: ['beşiktaş', 'fenerbahçe'], startTime : new Date('2018-09-18'),  geo: 'TR'})
.then(function(results){
  var resultJson = JSON.parse(results).default.timelineData,
	  item1 = resultJson.map(
								function(item){
									return item.value[0];
								}
							), 
	  item2 = resultJson.map(
								function(item){
									return item.value[1];
								}
							);

	// console.log(resultJson);
							
	// console.log('item1');
	// console.log(item1);

	// console.log('item2');
	// console.log(item2);

	console.log('rank');
	console.log(correlation.rank(item1, item2));

	console.log('determination');
	console.log(correlation.determination(item1, item2));

})
.catch(function(err){
  console.error('Oh no there was an error', err);
});