# grul.js
A recursive library for chaining generic recursive functions as lambda utilities. 

[npmjs](https://www.npmjs.com/package/grul)

#### Node Start
install grul with NPM.
```
npm install grul
```
require grull to any conveniently named non conflicting reference. examples here are referenced via "grul".
```javascript
const grul=require("grul");
```

#### CDN Start
```javascript
<script type="text/javascript" src="grul.js"></script>
```

#### Traverse, mutate, flatten multidimensional data
```javascript
var matrix = [ [ [5] , [6] ] , [ [7] , [8] ] ];
var flattened =[];
grul.atMeta(matrix,[Array,Array,Array],function(input){
    flattened.push(input);
});
console.log(flattened);
//  [ 5 , 6 , 7 , 8 ]
```

#### Mixin type and literal path values at any time
```javascript
var data = [
    {"name":"Ryan","age":26},
    {"name":"Sarah","age":27}
];
var names =[];
grul.atMeta(data,[Array,"name"],function(input){
    names.push(input);
}); 
console.log(names);
//  [ "Ryan" , "Sarah" ]
```

#### Locate patterns within data sets
Useful for templating and expanding 1:many configurations
```javascript
var data = [
    {"name":"Ryan","age":26, "Parents":[{"name":"Dorothy"}]},
    {"name":"Sarah","age":27}
]
grul.atPattern(data,[Array],function(input){
    console.log(input.name);
    // return false to stop recursion
});
// "Ryan"
// "Dorothy"
// "Sarah"
```

#### Attach head/tail recursive logic
```javascript
var data = [
    {"name":"Ryan","age":26, "Parents":[{"name":"Dorothy"}]},
    {"name":"Sarah","age":27}
];

//no mutation
JSON.stringify(
    grul.atPattern(data,[Array,Object],{
        "head":function(input,typePath,literalPath,root){
        input.constructor !== Array && input.constructor !== Object ? input+=" head mutation" : input ;
            // return false to stop recursion
        },
        "tail":function(input,typePath,literalPath,root){
            console.log( 
                grul.pluck( 
                    root ,
                    literalPath.slice(0,literalPath.length-1)
                )
            );
        }
    })
);
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Dorothy"}
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Sarah", age: 27}
// {name: "Sarah", age: 27}
// "[{\"name\":\"Ryan\",\"age\":26,\"Parents\":[{\"name\":\"Dorothy\"}]},{\"name\":\"Sarah\",\"age\":27}]"
//mutates
JSON.stringify(
    grul.atPattern(data,[Array,Object],{
        "head":function(input,typePath,literalPath,root){
        input.constructor !== Array && input.constructor !== Object ? grul.pluck(root,literalPath,input+" head mutation") : input;
            // return false to stop recursion
        },
        "tail":function(input,typePath,literalPath,root){
            console.log( 
                grul.pluck( 
                    root ,
                    literalPath.slice(0,literalPath.length-1)
                )
            );
        }
    })
);
// {name: "Ryan head mutation", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Ryan head mutation", age: "26 head mutation", Parents: [{name: "Dorothy"}]}
// {name: "Dorothy head mutation"}
// {name: "Ryan head mutation", age: "26 head mutation", Parents: [{name: "Dorothy head mutation"}]}
// {name: "Sarah head mutation", age: 27}
// {name: "Sarah head mutation", age: "27 head mutation"}
// "[{\"name\":\"Ryan head mutation\",\"age\":\"26 head mutation\",\"Parents\":[{\"name\":\"Dorothy head mutation\"}]},{\"name\":\"Sarah head mutation\",\"age\":\"27 head mutation\"}]"
```

#### Hierarchically group datasets with declarative templates
```javascript
grul.atHierarchy([   
    {EntityId:1,Action:"Transformed",Status:"Completed",Date:"2019-01-03"},
    {EntityId:1,Action:"Disappeared",Status:"Completed",Date:"2019-01-04"},
    {EntityId:2,Action:"Disappeared",Status:"In-Progress",Date:"2019-01-04"}    
],
[{
    name: {
        "head": (row, typePath, literalPath, template) => row.Action
    },
    value: {
        "tail": (rows, typePath, literalPath, template) => rows.length
    },
    records:{
        "tail": (rows, typePath, literalPath, template ) => rows
    },
    children: [{
        name: {
            "head": (row, typePath, literalPath, template) => row.Status
        },
        value: {
            "tail": (rows, typePath, literalPath, template) => rows.length
        },
        records: {
            "tail": (rows, typePath, literalPath, template ) => rows
        }
    }]
}])
/* Hierarchical output as processed by declarative template
    [{
        name:"Transformed",
        value:1,
        records:[{EntityId:1,Action:"Transformed",Status:"Completed",Date:"2019-01-03"}],
        children:[  {   name:"Completed",
                        value:1,
                        records:[{EntityId:1,Action:"Transformed",Status:"Completed",Date:"2019-01-03"}]
                    }]
    },{
        name:"Disappeared",
        value:2,
        records:[   {EntityId:1,Action:"Disappeared",Status:"Completed",Date:"2019-01-04"},
                    {EntityId:2,Action:"Disappeared",Status:"In-Progress",Date:"2019-01-04"}    ],
        children:[  {   name:"Completed",
                        value:1,
                        records:[{EntityId:1,Action:"Disappeared",Status:"Completed",Date:"2019-01-04"}]
                    },
                    {   name:"In-Progress",
                        value:1,
                        records:[{EntityId:2,Action:"Disappeared",Status:"In-Progress",Date:"2019-01-04"}]
                    }],
    }]
 */
```

#### Intelligently segment and prune multi-dimensional recursive patterns
```javascript
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
/* Expected Pruned output
 [
  {
    "name": "Ryan",
    "Projects": [
      {
        "name": "Payment Gateway",
        "duration": 4
      },
      {
        "name": "Event Registration",
        "duration": 4
      }
    ]
  },
  {
    "name": "Justin",
    "Projects": [
      {
        "name": "Customer Relations Management",
        "duration": 4
      },
      {
        "name": "Alumni Management Services",
        "duration": 4
      }
    ]
  }
]
 
 */
```
#### Traverse custom class instances
```javascript
//Defines ES5 "class"
function test(){
    this.funcMembString="test"
}

//traverses data hierarchy with custom ES5 "class"
grul.atMeta({
    test:{
        sub1:"branch1",
        sub2:new test()
    }
},[
    ["test","sub1"],
    ["test","sub2","funcMembString"]
],(data)=>{
    console.log(data)
});
```

#### JSON structure/data differential based on [RFC 6902](https://tools.ietf.org/html/rfc6902) ( atDiff )
```javascript

let newest = { name:"Mary Jane", parents:["Barb","John"], transactions:[10,-10,30,-10], dependents:[] };
let old1 = { name:"Mary Smith", parents:["Barb","Jon"], transactions:[10,-10,30], dependents:["Steve"] };
let old2 = { name:"Mary Jane", parents:["Barb","John"], transactions:[10,-30,30,-10], dependents:["Steve"] };
// generate patches?
grul.atDiff( [ newest, old1 ] , (patch)=>{ console.log(patch) } , 0 );
// generate patches for multiple stores?
grul.atDiff( [ newest, old1, old2 ] , (patch)=>{ console.log(patch) } , 0 );
// generate patches in the opposite direction?
grul.atDiff( [ newest, old1 ] , (patch)=>{ console.log(patch) } , 1 );
```

#### Circular Reference Halting
```javascript
let circ1 = { "key":1, "foreign":null };    //object as an entry point
let circ2 = { "key":2, "foreign":circ1 };   //object as a secondary reference
circ1.foreign = circ2;                      //attach circ1.foreign to circ2.foreign
grul.atPattern(circ1,[Object],{
	"head":(data,htp,hlp,hop)=>{ 
		console.log("circular reference halting test");
	}
});
//upon reaching a circular traversal path, program will recursively return stopping additional paths (logging out the traversal as well)
//expected output in this case would be "data traversal halted @ foreign-foreign"
```
#### Modify default custom enumerator(s)
```javascript
//Custom ES5 'Class'
function customType(){
    this.GetCustomEntries = ()=>{
        return ["another","object"];
    };
    this.GetOtherCustomEntries = ()=>{
        return ["other","object"];
    };
}
//single enumerator
grul.extend(customType,(data, metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct)=>{
        this.atPattern(data.GetCustomEntries(), metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct);
});
//multiple enumerators
grul.extend(customType,
[
    (data, metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct)=>{
        this.atPattern(data.GetCustomEntries(), metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct);
    },
    (data, metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct)=>{
        this.atPattern(data.GetOtherCustomEntries(), metaPath, logic, relativity, nhtpath, nhlpath, newMeta, rootData, direct);
    }
]);
```

#### Additional Features
* shallowest pattern searches at arbitrary depth ( atShallowestPattern )
* deepest patterns searches at arbitrary depth ( atDeepestPattern )
* normal recursive tree traversal with halting capabilities ( atEvery ) 
* define patterns with object templates ( atMatching )
* retrieve primitives ( atEnds )

#### Planned Future Changes
* User defined computation rules (faster large set computation)
  * Scalable Web Workers
  * Promise.then()