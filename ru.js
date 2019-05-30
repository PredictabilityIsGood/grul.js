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

var _ru=new ru();
try{
  module.exports.ru=_ru;
}
catch(exception){

}

function ru(){

  this.in=function(obj,key){ 
    return key in obj 
  };
  this.clear=function(key){ 
  	this.key = this.clone( this.defaults[key] );
  };
  this.clone=function(obj){
  	return JSON.parse(JSON.stringify(obj));
  };
  this.funcArgs=function(func) {  
    return (func + '')
      .replace(/[/][/].*$/mg,'')
      .replace(/\s+/g, '')
      .replace(/[/][*][^/*]*[*][/]/g, '') 
      .split('){', 1)[0].replace(/^[^(]*[(]/, '') 
      .replace(/=[^,]+/g, '') 
      .split(',').filter(Boolean);
  };
  this.executeLogic=function(logicController , location , patternIndex , aData , historicalTypePath , historicalLiteralPath , initial ){
    var logic=logicController;
    if(logic.constructor===Array){
      if(logic[patternIndex].constructor===Object){
        continueTraversal = location in logic[patternIndex] ? logic[patternIndex][location]( aData , historicalTypePath , historicalLiteralPath , initial ):true;
      }
      else{
        continueTraversal = logic[patternIndex]( aData , historicalTypePath , historicalLiteralPath , initial );
      }
    }
    else if(logic.constructor===Object){
      continueTraversal = location in logic ? logic[location]( aData ,  historicalTypePath , historicalLiteralPath , initial ):true;
    }
    else{
      continueTraversal = logic( aData , historicalTypePath , historicalLiteralPath , initial );
    }
  };
  
  //Recursive Helper Functions
  /*	Function Name: this.Pluck
   *	Description: This function traverses data given a path (array of literal traversals in order)
   */
  this.Pluck=function(data,path,set=null){
  	if(path.length>1){
        return this.Pluck( data[path[0]] , path.slice(1,path.length) , set );
    }
    else{
        if(path.length==0){
            return data;
        }
        else{
            if(set==null){
                if(data instanceof HTMLElement){
                    return data.getAttribute(path[0]);
                }
                else{
                    return data[path[0]];
                }
            }
            else{
                data[path[0]]=set;
                return data[path[0]];
            }
        }
    }
  };
  /* 	Function Name: this.PathExists
   *	Description: This function checks to see if given path exists in a set
   */
  this.PathExists=function( data , bindpath , curpath=[] ){
      var isEqual=this.ArrEquals(bindpath,curpath) && bindpath.length==curpath.length;
      if( isEqual ){
      }
      else{
          curpath.push(bindpath[curpath.length]);
      }
      try{
          if(this.Pluck(data,curpath) !== undefined ){
          		if(isEqual==true){
              	return true;
              }
              return this.PathExists(data , bindpath , curpath);
          }
          else{
              return bindpath.slice(curpath.length-1,bindpath.length);
          }
      }
      catch(exception){
          return bindpath.slice(curpath.length-1,bindpath.length);
      }
  };
  /*	Function Name: this.ArrEquals
   *	Description: This function iterates through array elements to check equality
   */
  this.ArrEquals=function(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
  };

	//Recursive Lambda's
  /* 	Function Name: this.atMeta
   *	Description: This function iterates through values which have matching literal/typepaths from the base of the object
   */
  this.atMeta=function(data,metaPath,logic,cont=false){
  	if(metaPath.length>0){
      if(metaPath[0].constructor === Function ){
        //find object types of matching .constructor
        if(metaPath[0]===data.constructor){
          if(metaPath[0] == Object){
            //Iterate through object calling atMeta for each item
            Object.keys(data).forEach((key)=>{
              this.atMeta(data[key],metaPath.slice(1,metaPath.length),logic,cont);
            });
          }
          else if(metaPath[0] == Array){
            //Iterate through array calling atMeta for each item
            for(var i=0; i<data.length; i++){
              this.atMeta(data[i],metaPath.slice(1,metaPath.length),logic,cont);
            }
          }
        }
        else if(metaPath[0]===Array || metaPath[0]===Object){
        }
        else{
          this.atMeta(metaPath[0](data),metaPath.slice(1,metaPath.length),logic,cont);
        }
      }
      else if(metaPath[0].constructor === String){
        //find object key of string
        this.atMeta(data[metaPath[0]],metaPath.slice(1,metaPath.length),logic,cont);
        
      }
      else if(metaPath[0].constructor === Number){
        //find array index of value
        this.atMeta(data[metaPath[0]],metaPath.slice(1,metaPath.length),logic,cont);
      }
		}
    else{
    	//Perform Logic
      logic( data , this );
     	//this.reset(cont);
      return this;
    }
  };
  /*	Function Name: this.atPattern
   *	Description: This function iterates through values which have matching literal/typepaths throughout the entirety of an object 
   *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
   */
  this.atPattern=function(data,metaPath,logic,relativity=0,cont=false,historicalTypePath=[],historicalLiteralPath=[],curMetaIndex=0,rootData=data){
    var matched = {};
    var aData;

    if(metaPath[0].constructor===Array){
      //Perform Patterns in optimized single pass
      if(curMetaIndex.constructor===Array){}
      else{
        curMetaIndex=[];
        for(var i=0;i<metaPath.length;i++){
          curMetaIndex.push(0);
        }
      }
    }
    else{
      metaPath=[metaPath];
      curMetaIndex=[0];
    }

    if(historicalLiteralPath.length>0){
      for(var i=0;i<metaPath.length;i++){
        if(historicalTypePath[historicalTypePath.length-1].name == metaPath[i][curMetaIndex[i]].name ){
          //increment curMetaIndex
          curMetaIndex[i] = curMetaIndex[i]+1;
        }
        else if(historicalLiteralPath[historicalLiteralPath.length-1] == metaPath[i][curMetaIndex[i]]){
          //increment curMetaIndex
          curMetaIndex[i] = curMetaIndex[i]+1;
        }
        else{
          //reset curMetaIndex
          curMetaIndex[i] = 0;
        }
        if(curMetaIndex[i] == metaPath[i].length){
          var continueTraversal;
          aData = relativity == 0 ? data : this.Pluck(rootData,historicalLiteralPath.slice(0,(historicalLiteralPath.length)+relativity));

          continueTraversal = this.executeLogic(logic , "head" , i , aData , historicalTypePath , historicalLiteralPath , rootData );

          if(continueTraversal == false){
            return aData; //break if logic returns false
          }
          matched[i] = true;
          curMetaIndex[i] = 0;
        }
      }
    }
    
    
    if(data.constructor===Object){
    	Object.keys(data).forEach((key)=>{
      	var nhtpath=historicalTypePath.slice(0,historicalTypePath.length);
        nhtpath.push(Object);
        let nhlpath=this.clone(historicalLiteralPath);
        nhlpath.push(key);
      	this.atPattern(data[key],metaPath,logic,relativity,cont,nhtpath,nhlpath,curMetaIndex,rootData);
      });
    }
    else if(data.constructor===Array){
    	for(var i=0; i<data.length; i++){
      	var nhtpath=historicalTypePath.slice(0,historicalTypePath.length);
        nhtpath.push(Array);
        let nhlpath=this.clone(historicalLiteralPath);
        nhlpath.push(i);
      	this.atPattern(data[i],metaPath,logic,relativity,cont,nhtpath,nhlpath,curMetaIndex,rootData);
      }
    }

    //Tail Logic
    if(logic.constructor === Array){
      for(var i=0;i<metaPath.length;i++){
        if(i in matched){
          continueTraversal = this.executeLogic(logic , "tail" , i , aData , historicalTypePath , historicalLiteralPath , rootData );
          if(continueTraversal==false){
            return aData;
          }
        }
      }
    }
    
  };
  
  /*	Function Name: this.atShallowestPattern
   *	Description: This function iterates this.atPattern, stores the inputs with the least depth to be executed logically
   *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
   */
  this.atShallowestPattern=function(data,metaPath,logic,relativity=0,cont=false){
    var	leastDepth=Infinity;
    var inputs=[];
    this.atPattern(data,metaPath,function(input,historicalTypePath,historicalLiteralPath){
      if(historicalLiteralPath.length<leastDepth){
        leastDepth=historicalLiteralPath.length;
        inputs=[];
      	inputs.push(input);
      }
      else if(historicalLiteralPath.length>leastDepth){
      	return false;
      }
      else{
      	inputs.push(input);
      }
    },relativity,cont);
    for(var i=0;i<inputs.length; i++){
    	logic(inputs[i]);
    }
  };
  /*	Function Name: this.atDeepestPattern
   *	Description: This function iterates this.atPattern, stores the inputs with most depth to be executed logically - (Returns false within .atPattern where depth is greater than)
   *	- With cont==true this.atPattern will spawn new pattern traversals when patterns are recorgnized to ensure it matches patters overlapping patterns (Warning, may be expensive)
   */
  this.atDeepestPattern=function(data,metaPath,logic,relativity=0,cont=false){
  	var	greatestDepth=-1;
    var inputs=[];
    this.atPattern(data,metaPath,function(input,historicalTypePath,historicalLiteralPath){
      if(historicalLiteralPath.length>greatestDepth){
        greatestDepth=historicalLiteralPath.length;
        inputs=[];
      }
      inputs.push(input);
    },relativity,cont);
    for(var i=0;i<inputs.length; i++){
    	logic(inputs[i]);
    }
  };
  /* 	Function Name: this.atEnds
   *	Description: This function iterates through the primitive ends of objects
   */
  this.atEnds=function(data,logic){
  	if(data.constructor===Object){
    	Object.keys(data).forEach((key)=>{
    		this.atEnds(data[key],logic);
      })
    }
    else if(data.constructor===Array){
    	for(var i=0; i<data.length; i++){
      	this.atEnds(data[i],logic);
      }
    }
    else if(data.constructor===Function){
    	if(this.funcArgs(data).length==0){
      	this.atEnds(data(),logic)
      }
    }
    else{
    	logic(data);
    }
  };
  /*	Function Name: this.atEvery
   * 	Description: This function runs passed logic at every potential traversal or endpoint
   */
  this.atEvery=function(data,logic,historicalTypePath=[],historicalLiteralPath=[],rootData=data){
    var iContinue = logic(data,logic,historicalTypePath,historicalLiteralPath,rootData);
    if( !(iContinue==true || iContinue==undefined || iContinue==null) ){
    	return;
    }
    
    
    var newTypePath=this.clone(historicalTypePath);
    newTypePath.push(data.constructor);
    if(data.constructor==Array){
    	for(var i=0;i<data.length;i++){
      	var newLitPath=this.clone(historicalLiteralPath);
        newLitPath.push(i);
        this.atEvery(data[i],logic,newTypePath,newLitPath,rootData);
      }
    }
    else if(data.constructor==Object){
    	Object.keys(data).forEach((key)=>{
      	var newLitPath=this.clone(historicalLiteralPath);
        newLitPath.push(key);
        this.atEvery(data[key],logic,newTypePath,newLitPath,rootData);
      });
    }
  }
  /*	Function Name: this.atMetaEnds
   * 	Description: This function runs this.atMeta, and then performs logic at the ends of the object returned to it by this.atMeta
   */
  this.atMetaEnds=function(data,metaPath,logic){
  	var recursiveRef=this;
    recursiveRef.atMeta(data,metaPath,function(input){
    	recursiveRef.atEnds(input,logic);
    });
    return data;
  };
  /*	Function Name: this.atPatternEnds
   *	Description: This function runs this.atPattern, and then performs logic at the pattern of the object returned to it by this.atPattern
   */
  this.atPatternEnds=function(data,metaPath,logic,relativity=0){
  	var recursiveRef=this;
  	recursiveRef.atPattern(data,metaPath,function(input){ 
    	recursiveRef.atEnds(input,logic);
    }, relativity);
    return data;
  };
  /*	Function Name: this.atMatching
   *	Description: This function traverses through set, determining if same path exists in data, and executes the associated path function "atMatchingFunction" or the sequence
   */
  this.atMatching=function(data,set,metaPath=[],literalPath=[]){
  	var curObj=this.Pluck(set,metaPath);
    var curData;
    var exists=false;
    try{
     curData=this.Pluck(data,metaPath);
     exists=true;
    }
    catch(exception){
    	//no such path exists
      exists=false;
    }
    
  	if(curObj.constructor.name=="Object"){
    	Object.keys(curObj).forEach( (key) => {
      	var nMetaPath = this.clone(metaPath);
        nMetaPath.push(key);
        var nLiteralPath = this.clone(literalPath);
        nLiteralPath.push(key);
        this.atMatching(data,set,nMetaPath,nLiteralPath);
      	
      });
    }
    else if(curObj.constructor.name=="Array" && exists){
    	for(var i=0; i<curObj.length;i++){
      	var nMetaPath = this.clone(metaPath);
        nMetaPath.push(i);
        for(var x=0; x<curData.length;x++){
        	var nLiteralPath = this.clone(literalPath);
          nLiteralPath.push(x);
        	this.atMatching(data,set,nMetaPath,nLiteralPath);
        }        
      }
    }
    else if(curObj.constructor.name=="Function"){
    	if(metaPath[metaPath.length-1]=="atMatchingFunction"){
      	//Perform Logic at Path of data object
        curObj( this.Pluck(data,literalPath.slice(0,literalPath.length-1)) , this )
      }
    }
    else if(curObj.constructor.name=="String"){
    	if(metaPath[metaPath.length-1]=="atMatchingFunction"){
      	//Perform Logic at Path of data object
        window[curObj]( this.Pluck(data,literalPath.slice(0,literalPath.length-1)) , this )
      }
      else if(exists){
      	curData+=curObj
      }
    }
    else if(curObj.constructor.name==="Number" && exists){
    	//Do an Equivalence Modifier
      if(curData.constructor.name == curObj.constructor.name){
      	curData+=curObj;
      }
    }
  };
  /*	Function Name: this.atDepth
   *	Description: This function traverses through set, pushing all items at a dimensional depth from base into an array and returning them
   */
  this.atDepth=function(data,depth=0,logic ,historicalTypePath=[],historicalLiteralPath=[],first=true, rootData=data){
  	if(first==true){
    	this.atDepthContainer=[];
    	first=false;
    }
    
    if(depth>0){
    	depth--
    	if(data.constructor.name=="Object"){
      	Object.keys(data).forEach( (key) => {
        	this.atDepth(data[key],depth,logic,first);
        })
      }
      else if(data.constructor.name=="Array"){
      	for(var i=0; i<data.length;i++){
        	this.atDepth(data[i],depth,logic,first);
        }
      }
    }
    else{
      this.logic(data,historicalTypePath,historicalLiteralPath,rootData);
    	this.atDepthContainer.push(data);      
    }
    
    return this.atDepthContainer;
  };
  /*	Function Name: this.atDiff
   *	Description: This function traverses through multiple sets, keeping track of the structural and data differential's between all listed sets. Base sets must be held in array form
   */
 	this.atDiff=function(data,diflogic=null,relativity=0,cont=false,primary=0){
  	var PatchDiffs=[];
    if(data.constructor === Array ){
    	if(data.length>1){
        this.atEvery(data[0],(curData,logic,metaPath,literalPath,rootData)=>{
        	for(var i=1; i<data.length; i++){
          	//compare 0th to others
            var diffCheck = this.PathExists(data[i],literalPath);
            if(diffCheck==true && diffCheck.constructor===Boolean){
            	if(curData.constructor!= Object && curData.constructor !=Array){
                var compareSetVal=this.Pluck(data[i],literalPath);
                if(curData == compareSetVal){
                  //set equivalent
                }
                else{
                  var newPath=this.clone(literalPath);
                  newPath.splice(0,0,i)
                  //set requires updating to base set
                  var newPatch={"op":"replace", "path":newPath, "value": curData, "ref":data};
                  PatchDiffs.push(newPatch);
                  if(diflogic!=null){
                    diflogic(curData,literalPath,rootData,data,i,newPatch);
                  }
                }
               }
            	return true;
            }
            else{
            	var newPath=this.clone(literalPath);
              newPath.splice(0,0,i)
            	var newPatch={"op":"add", "path":newPath, "value":curData, "ref":data};
            	PatchDiffs.push(newPatch);
              if(diflogic!=null){
              	diflogic(curData,literalPath,rootData,data,i,newPatch);
              }
              return false;
            }
            
          }
        });
      }
      else{
      	console.log("Nothing to compare against");
      }
    }
    else{
    	console.log("Base data is not an array");
    }
    
    return PatchDiffs;
  };

}