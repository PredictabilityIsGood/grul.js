/*  Author: Ryan Taylor Montgomery
 *  Description: Test data set and recursive lambda functions 
 */

/* Example Data Set */
var data = [
	{"name":"Ryan",			"age":25, "movies":["Saving Private Ryan","Shawshank Redemption","Interstellar"],	"parents":[{ "name" :"Dorothy"}] },
	{"name":"Plato",		"age":38, "movies":["a Movie"] },
	{"name":"Socrates",	"age":24, "misc": { "cd":"whatever"} }
]

/* Example Functions */


//Finds Pattern and iterates through all items within an array
r3.atPattern(data,[Array],function(input){
	console.log(input);
});

//Finds Pattern of all items that are strings directly within an array 
r3.atPattern(data,[Array,String],function(input){
	console.log(input);
});


//Retrieves all items within an array directly from the root data set
r3.atMeta(data,[Array],function(input){
	console.log(input);
});

//Retrieves all items identified by an array and then a literal path "name" directly from the root data set
r3.atMeta(data,[Array,"name"],function(input){ 
	console.log(input);
});


//Finds Pattern of Arrays at the shallowest level found within the whole data set
r3.atShallowestPattern(data,[Array],function(input){
	console.log(input);
});

//Finds Pattern of Arrays at the deepest level found within the whole data set
r3.atDeepestPattern(data,[Array],function(input){
	console.log(input);
});

//Finds Pattern within the dataset and sets a datakey three paths before 
r3.atPattern(data,["parents",0,"name"],function(input){ 
	input["parent-name"]=input["parents"][0]["name"];
},-3);

//Pushes depth 2 data paths into array for return (Will be extended with a lambda soon)
console.log( r3.atDepth(data,2) );

//Finds differences between data sets and returns them in accordance with RFC6902 JSON Patch Format (Slightly Modified )
console.log(	r3.atDiff(	[data[0],data[1]]	)	);	

//Given the traversed structure of the setter, perform the function at the matching meta-path
var setter = [
  {
    "atMatchingFunction":function(input){
      console.log(input);
    }
  }
];
//Finds object with matching Path Traversal and executes custom function on said path
r3.atMatching(data,setter);