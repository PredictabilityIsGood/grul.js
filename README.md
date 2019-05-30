# ru.js
A recursive library for chaining generic recursive functions as lambda utilities.

### Traverse, mutate, flatten multidimensional sets with incredibly simple and short syntax
```javascript
var matrix = [ [ [5] , [6] ] , [ [7] , [8] ] ];
var flattened =[];
ru.atMeta(matrix,[Array,Array,Array],function(input){
    flattened.push(input);
});
console.log(flattened);
//  [ 5 , 6 , 7 , 8 ]
```

### Mixin type and literal path values at any time
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

### Locate patterns within data sets (useful for templating data)
```javascript
var data = [
    {"name":"Ryan","age":26, "Parents":[{"name":"Dorothy"}]},
    {"name":"Sarah","age":27}
]
ru.atPattern(data,[Array,Object],function(input){
    console.log(input.name);
});
// "Ryan"
// "Dorothy"
// "Sarah"
```
