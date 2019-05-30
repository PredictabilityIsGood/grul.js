# ru.js
A recursive library for chaining generic recursive functions as lambda utilities.

Traverse, mutate, flatten multidimensional sets with incredibly simple and short syntax:

```javascript
var 3d = [ [ [5] , [6] ] , [ [7] , [8] ] ];
var flattened =[];
ru.atMeta(data,[Array,Array,Array],function(input){
    flattened.push(input);
});
console.log(flattened);
/* 
 *
 */
```

Mixin type and literal path values at any time:

```javascript
var data = [
    {"name":"Ryan","age":26},
    {"name":"Sarah","age":27}
];
var names =[];
ru.atMeta(data,[Array,"name"],function(input){
    names.push(input);
}); 
```


