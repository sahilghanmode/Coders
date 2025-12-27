import fs from 'fs';
import path from 'path';
import { DefinitionParser } from './DefinitionParser';
import { FullDefinitionParser } from './FullDefinitionParser';
   
function partialBoilerPlateGenerator(generatorFilePath:string){
    const inputFilePath=path.join(__dirname,generatorFilePath,"structure.md");

    const boilerplatePath=path.join(__dirname,generatorFilePath,"boilerplate");

    const inputpath=fs.readFileSync(inputFilePath,'utf-8');

    const parser=new DefinitionParser();

    parser.parse(inputpath);

    const cppCode=parser.generateCppBoilerplate();
    // const javaCode=parser.generateJavaBoilerplate();
    // const javaTestCode=parser.generateJavaTestBoilerplate();
    const pythonCode=parser.generatePythonBoilerplate();
    
    if(!fs.existsSync(boilerplatePath)){
        fs.mkdirSync(boilerplatePath);
    }

    fs.writeFileSync(path.join(boilerplatePath,'function.cpp'),cppCode);
    // fs.writeFileSync(path.join(boilerplatePath,'function.java'),javaCode);
    fs.writeFileSync(path.join(boilerplatePath,'function.py'),pythonCode);

    console.log("boilerplate code generated successfully")
}

function fullBoilerPlateGenerator(generatorFilePath:string){
    const inputFilePath=path.join(__dirname,generatorFilePath,"structure.md");
    
    const fullboilerplatePath=path.join(__dirname,generatorFilePath,"boilerplate_full");

    const inputpath=fs.readFileSync(inputFilePath,'utf-8');

    const parser=new FullDefinitionParser();
    parser.parse(inputpath);

    console.log(parser.generateJavaScriptFullBoilerplate());

    // console.log(inputpath)
}

// partialBoilerPlateGenerator('../../problems/1');

fullBoilerPlateGenerator('../../problems/1');