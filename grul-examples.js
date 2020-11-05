/*  Author: Ryan Taylor Montgomery
 *  Date: May 27th 2019
 *  License: MIT License
 *
 *	Copyright (c) 2019 Vault Lambda LLC
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all
 *	copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *	SOFTWARE.
 * 
 */

try{
	const grul = require("grul");
}
catch(exception){
	console.log("non require context");
}

/* Example Data Set */
var data = [
	{"name":"Ryan",	"age":25, "movies":["Saving Private Ryan","Shawshank Redemption","Interstellar"],	"parents":[{ "name" :"Dorothy"}] },
	{"name":"Plato","age":38, "movies":["a Movie"] },
	{"name":"Socrates",	"age":24, "misc": { "cd":"whatever"} }
]

/* Example Functions */

//Finds Pattern and iterates through all items within an array
grul.atPattern(data,[Array],function(input){
	console.log(input);
});

//Finds and executes logic in the least computationally expensive way possible
grul.atPattern(data,[
	[Array],
	[Array,Object]
],[
	function(input){
		console.log(input);
	},
	function(input){
		console.log(input);
	}
]);


//Executes logic at head and tail (Can be combined with multiple patterns)
grul.atPattern(data,[Array,Object],{
	"head":function(input){
		console.log(input);
	},
	"tail":function(input){
		console.log(input);
	}
})

//Finds Pattern of all items that are strings within objects within an array 
grul.atPattern(data,[Array,Object,String],function(input){
	console.log(input);
});


//Retrieves all items within an array directly from the root data set
grul.atMeta(data,[Array],function(input){
	console.log(input);
});

//Retrieves all items identified by literal path "name" within an array directly from the root data set
grul.atMeta(data,[Array,"name"],function(input){ 
	console.log(input);
});


//Finds Pattern at the shallowest level within an Array and the whole data set.  
grul.atShallowestPattern(data,[Array],function(input){
	console.log(input);
});

//Finds Pattern at the deepest level within an Array the whole data set
grul.atDeepestPattern(data,[Array],function(input){
	console.log(input);
});

//Finds Pattern within the dataset and sets a datakey three paths before 
grul.atPattern(data,["parents",0,"name"],function(input){ 
	input["parent-name"]=input["parents"][0]["name"];
},-3);

//Pushes depth 2 data paths into array for return (Will be extended with a lambda soon)
grul.atDepth(data,2,function(input){
	console.log(input);
});

//Finds differences between data sets and returns them in accordance with RFC6902 JSON Patch Format (Slightly Modified)
grul.atDiff([
	data[0],
	data[1]
]);	

//Given the traversed path of the setter, perform the function at the matching meta-path
var setter = [
  {
    "atMatchingFunction":function(input){
      console.log(input);
    }
  }
];
//Finds object with matching Path Traversal and executes custom function on said path
grul.atMatching(data,setter);

//Segments object with first occurrence depth and prunes the discovery tree
grul.atSegment({"Users":[{
	"name":"Ryan",
	"Projects":[{
		"name":"Payment Gateway",
		"duration":4
	},{
		"name":"Event Registration",
		"duration":4
	}],
	"Transactions":[5,6,7,8]
	
},{
	"name":"Justin",
	"Projects":[{
		"name":"Customer Relations Management",
		"duration":4
	},{
		"name":"Alumni Management Services",
		"duration":4
	}],
	"Transactions":[1,2,3,4]
}]
},
{
"include":[["Users"]],
"exclude":[["Transactions"]]
},
(data,htp,hlp,hop)=>{},{
depth:1,
lag:0
}).map(data=>data.data)[0];

//Defines custom ES5 function and then traverses it to retrieve the requested path values
function test(){
    this.funcMembString="test"
}

grul.atMeta({
    test:{
        sub1:"branch1",
        sub2:new test()
    }
},[
    ["test","sub1"],
    ["test","sub2","funcMembString"]
],(data)=>{console.log(data)});



let newest = { name:"Mary Jane", parents:["Barb","John"], transactions:[10,-10,30,-10], dependents:[] };
let old1 = { name:"Mary Smith", parents:["Barb","Jon"], transactions:[10,-10,30], dependents:["Steve"] };
let old2 = { name:"Mary Jane", parents:["Barb","John"], transactions:[10,-30,30,-10], dependents:["Steve"] };
// generate patches?
grul.atDiff( [ newest,  old1] , (patch)=>{ console.log(patch) } , 0 );
// generate patches for multiple stores?
grul.atDiff( [ newest, old1, old2 ] , (patch)=>{ console.log(patch) } , 0 );
// generate patches in the opposite direction?
grul.atDiff( [ newest, old1 ] , (patch)=>{ console.log(patch) } , 1 );