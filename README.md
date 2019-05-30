# ru.js
A recursive library for chaining generic recursive functions as lambda utilities.

#### Traverse, mutate, flatten multidimensional
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
ru.atPattern(data,[Array,Object],function(input){
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
]
ru.atPattern(data,[Array,Object],{
    "head":function(input){
       input.name=input.name+" head mutation"
        // return false to stop recursion
    }
    "tail":function(input,typePath,literalPath,root){
        console.log( 
            ru.Pluck( 
                root ,
                literalPath.slice(0,literalPath.length-1)
            )
        );
    }
});
// [    
//      {"name":"Ryan","age":26, "Parents":[{"name":"Dorothy"}]},
//      {"name":"Sarah","age":27}   
// ]
// [    {"name":"Dorothy"}      ]
//
```

#### Additional Features

shallowest pattern searches at arbitrary depth
deepest patterns searches at arbitrary depth

JSON Diff building