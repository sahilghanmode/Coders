export class DefinitionParser{
    problemName:string="";
    functionName:string="";
    inputStructure:{type:string,name:string}[]=[];
    outputStructure:{type:string,name:string}[]=[];

    parse(input:string){

        const lines=input.split('\n').map(line=>line.trim());

        let currentSection:string | null=null;

        lines.forEach(line=>{
            if(line.startsWith('Problem Name:')){
                this.problemName=line.split(':')[1].trim();
            }else if(line.startsWith('Function Name:')){
                this.functionName=line.split(':')[1].trim();
                currentSection='input';
            }else if(line.startsWith('Input Structure:')){
                currentSection='input';
            }else if(line.startsWith('Output Structure:')){
                currentSection='output';
            }else if(line.startsWith('Input Field:')){
                if(currentSection==='input'){
                    const field=line.split(':')[1].trim();
                    const type=field.split(' ')[0];
                    const name=field.split(' ')[1];
                    this.inputStructure.push({type,name});
                }
            }else if(line.startsWith('Output Field:')){
                if(currentSection==='output'){
                    const field=line.split(':')[1].trim();
                    const type=field.split(' ')[0];
                    const name=field.split(' ')[1];
                    this.outputStructure.push({type,name});
                }
            }
        })

        console.log(this.functionName, this.inputStructure, this.outputStructure, this.problemName);

    }

    generateCppBoilerplate():string{
        let boilerplate=`// Problem: ${this.problemName}\n`;
        boilerplate+=`// Function: ${this.functionName}\n\n`;
        boilerplate+=`#include <iostream>\nusing namespace std;\n\n`;
        boilerplate+=`void ${this.functionName}(`;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.type} ${field.name}`;
            if(index!==this.inputStructure.length-1){
                boilerplate+=', ';
            }
        });
        boilerplate+=`){\n //your code here \n}\n\n`;
        return boilerplate;
    }

    generatePythonBoilerplate():string{
        let boilerplate=`# Problem: ${this.problemName}\n`;
        boilerplate+=`# Function: ${this.functionName}\n\n`;
        boilerplate+=`def ${this.functionName}(`;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.type} ${field.name}`;
            if(index!==this.inputStructure.length-1){
                boilerplate+=', ';
            }
        });
        boilerplate+=`):\n    #your code here\n\n`;
        return boilerplate;
    }

    generateJavaBoilerplate():string{
        let boilerplate=``;
       
        boilerplate+=`public class ${this.functionName}{\n    //your code here\n}\n\n`;
        return boilerplate;
    }

    generateJavaScriptBoilerplate():string{
        let boilerplate=`// Problem: ${this.problemName}\n`;
        boilerplate+=`// Function: ${this.functionName}\n\n`;
        boilerplate+=`function ${this.functionName}(`;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.type} ${field.name}`;
            if(index!==this.inputStructure.length-1){
                boilerplate+=', ';
            }
        });
        boilerplate+=`){\n    //your code here\n}\n\n`;
        return boilerplate;
    }

    mapTypeToJava(type:string):string{
        const typeMapping:{[key:string]:string}={
            'int':'int',
            'float':'float',
            'double':'double',
            'String':'String',
            'char':'char',
            'boolean':'boolean'
        };
        return typeMapping[type] || 'Object';
    }

    generateJavaTestBoilerplate():string{
        let boilerplate=``;
        boilerplate+=`import org.junit.Test;\n\n`;
        boilerplate+=`public class ${this.functionName}Test{\n    @Test\n    public void test(){\n        `;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.type} ${field.name}=new ${this.mapTypeToJava(field.type)}();\n        `;
            if(index!==this.inputStructure.length-1){
                boilerplate+='\n        ';
            }
        });
        boilerplate+=`assertEquals(new ${this.functionName}(`;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.name}`;
            if(index!==this.inputStructure.length-1){
                boilerplate+=', ';
            }
        });
        boilerplate+=`), ${this.functionName}(`;
        this.inputStructure.forEach((field,index)=>{
            boilerplate+=`${field.name}`;
            if(index!==this.inputStructure.length-1){
                boilerplate+=', ';
            }
        });
        boilerplate+=`));\n    }\n}\n\n`;
        return boilerplate;
    }


    
}
