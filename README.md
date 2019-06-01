# ru.js
A recursive library for chaining generic recursive functions as lambda utilities. 

#### Traverse, mutate, flatten multidimensional data
```javascript
var matrix = [ [ [5] , [6] ] , [ [7] , [8] ] ];
var flattened =[];
ru.atMeta(matrix,[Array,Array,Array],function(input){
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
ru.atMeta(data,[Array,"name"],function(input){
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
ru.atPattern(data,[Array],function(input){
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
JSON.stringify(ru.atPattern(data,[Array,Object],{
    "head":function(input,typePath,literalPath,root){
       input.constructor !== Array && input.constructor !== Object ? input+=" head mutation" : input ;
        // return false to stop recursion
    },
    "tail":function(input,typePath,literalPath,root){
		console.log( 
            ru.Pluck( 
                root ,
                literalPath.slice(0,literalPath.length-1)
            )
        );
    }
}));
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Dorothy"}
// {name: "Ryan", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Sarah", age: 27}
// {name: "Sarah", age: 27}
// "[{\"name\":\"Ryan\",\"age\":26,\"Parents\":[{\"name\":\"Dorothy\"}]},{\"name\":\"Sarah\",\"age\":27}]"
//mutates
JSON.stringify(ru.atPattern(data,[Array,Object],{
    "head":function(input,typePath,literalPath,root){
       input.constructor !== Array && input.constructor !== Object ? ru.Pluck(root,literalPath,input+" head mutation") : input;
        // return false to stop recursion
    },
    "tail":function(input,typePath,literalPath,root){
		console.log( 
            ru.Pluck( 
                root ,
                literalPath.slice(0,literalPath.length-1)
            )
        );
    }
}));
// {name: "Ryan head mutation", age: 26, Parents: [{name: "Dorothy"}]}
// {name: "Ryan head mutation", age: "26 head mutation", Parents: [{name: "Dorothy"}]}
// {name: "Dorothy head mutation"}
// {name: "Ryan head mutation", age: "26 head mutation", Parents: [{name: "Dorothy head mutation"}]}
// {name: "Sarah head mutation", age: 27}
// {name: "Sarah head mutation", age: "27 head mutation"}
// "[{\"name\":\"Ryan head mutation\",\"age\":\"26 head mutation\",\"Parents\":[{\"name\":\"Dorothy head mutation\"}]},{\"name\":\"Sarah head mutation\",\"age\":\"27 head mutation\"}]"
```

#### Additional Features
* shallowest pattern searches at arbitrary depth ( atShallowestPattern )
* deepest patterns searches at arbitrary depth ( atDeepestPattern )
* normal recursive tree traversal with halting capabilities ( atEvery ) 
* define patterns with object templates ( atMatching )
* retrieve primitives ( atEnds )

#### In-Progress
* JSON Structure/Data Differential based on [RFC 6902](https://tools.ietf.org/html/rfc6902)

#### Planned Future Changes
* Circular Reference Halting
* Dynamic Type Handling
* User defined computation rules (faster large set computation)
  * Scalable Web Workers
  * Promise.then()