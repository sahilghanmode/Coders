export class FullDefinitionParser {
    problemName: string = "";
    functionName: string = "";
    inputStructure: { type: string; name: string }[] = [];
    outputStructure: { type: string; name: string }[] = [];

    parse(input: string) {
        const lines = input.split('\n').map(line => line.trim());
        let currentSection: string | null = null;

        lines.forEach(line => {
            if (line.startsWith('Problem Name:')) {
                const match = line.match(/\*\*(.+?)\*\*/);
                this.problemName = match ? match[1] : line.split(':')[1].trim();
            }
            else if (line.startsWith('Function Name:')) {
                this.functionName = line.split(':')[1].trim();
            }
            else if (line.startsWith('Input Structure:')) {
                currentSection = 'input';
            }
            else if (line.startsWith('Output Structure:')) {
                currentSection = 'output';
            }
            else if (line.startsWith('Input Field:')) {
                if (currentSection === 'input') {
                    const field = line.split(':')[1].trim();
                    const { type, name } = this.parseField(field);
                    this.inputStructure.push({ type, name });
                }
            }
            else if (line.startsWith('Output Field:')) {
                if (currentSection === 'output') {
                    const field = line.split(':')[1].trim();
                    const { type, name } = this.parseField(field);
                    this.outputStructure.push({ type, name });
                }
            }
        });
    }

    private parseField(field: string): { type: string; name: string } {
        const parts = field.trim().split(/\s+/);
        const name = parts[parts.length - 1];
        const type = parts.slice(0, -1).join(' ');
        return { type, name };
    }

    generateCppFullBoilerplate(): string {
        const returnType = this.outputStructure.length === 1 ? this.outputStructure[0].type : 'void';
        const params = this.inputStructure.map(i => `${i.type} ${i.name}`).join(', ');

        // Generate input reading code
        const inputReading = this.inputStructure.map(input => {
            if (input.type === 'int' || input.type === 'long' || input.type === 'float' || input.type === 'double') {
                return `    ${input.type} ${input.name};\n    cin >> ${input.name};`;
            } else if (input.type === 'string') {
                return `    string ${input.name};\n    cin >> ${input.name};`;
            } else if (input.type === 'vector<int>') {
                return `    int n_${input.name};\n    cin >> n_${input.name};\n    vector<int> ${input.name}(n_${input.name});\n    for(int i = 0; i < n_${input.name}; i++) cin >> ${input.name}[i];`;
            } else if (input.type === 'vector<string>') {
                return `    int n_${input.name};\n    cin >> n_${input.name};\n    vector<string> ${input.name}(n_${input.name});\n    for(int i = 0; i < n_${input.name}; i++) cin >> ${input.name}[i];`;
            } else if (input.type === 'vector<vector<int>>') {
                return `    int rows_${input.name}, cols_${input.name};\n    cin >> rows_${input.name} >> cols_${input.name};\n    vector<vector<int>> ${input.name}(rows_${input.name}, vector<int>(cols_${input.name}));\n    for(int i = 0; i < rows_${input.name}; i++)\n        for(int j = 0; j < cols_${input.name}; j++)\n            cin >> ${input.name}[i][j];`;
            }
            return `    ${input.type} ${input.name}; // TODO: Add input reading`;
        }).join('\n\n');

        // Generate function call
        const paramNames = this.inputStructure.map(i => i.name).join(', ');
        const functionCall = returnType !== 'void' 
            ? `${returnType} result = ${this.functionName}(${paramNames});`
            : `${this.functionName}(${paramNames});`;

        // Generate output printing
        let outputPrinting = '';
        if (returnType !== 'void') {
            const output = this.outputStructure[0];
            if (output.type === 'vector<int>' || output.type === 'vector<string>') {
                outputPrinting = `    for(auto x : result) cout << x << " ";\n    cout << endl;`;
            } else if (output.type === 'vector<vector<int>>') {
                outputPrinting = `    for(auto row : result) {\n        for(auto x : row) cout << x << " ";\n        cout << endl;\n    }`;
            } else {
                outputPrinting = `    cout << result << endl;`;
            }
        }

        return `#include <bits/stdc++.h>
using namespace std;

**Your Code Goes Here**

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
${inputReading}

    ${functionCall}
    
${outputPrinting}
    
    return 0;
}`;
    }

    
    generatePythonFullBoilerplate(): string {
        const hasListType = this.inputStructure.some(i => i.type.includes('vector')) || 
                           this.outputStructure.some(o => o.type.includes('vector'));
        const imports = hasListType ? 'from typing import List\n' : '';

        const returnType = this.outputStructure.length === 1 
            ? this.mapTypeToPython(this.outputStructure[0].type) 
            : 'None';
        
        const params = this.inputStructure.map(i => 
            `${i.name}: ${this.mapTypeToPython(i.type)}`
        ).join(', ');

        // Generate input reading
        const inputReading = this.inputStructure.map(input => {
            if (input.type === 'int' || input.type === 'long') {
                return `${input.name} = int(input())`;
            } else if (input.type === 'float' || input.type === 'double') {
                return `${input.name} = float(input())`;
            } else if (input.type === 'string') {
                return `${input.name} = input()`;
            } else if (input.type === 'vector<int>') {
                return `${input.name} = list(map(int, input().split()))`;
            } else if (input.type === 'vector<string>') {
                return `${input.name} = input().split()`;
            } else if (input.type === 'vector<vector<int>>') {
                return `rows = int(input())\n${input.name} = [list(map(int, input().split())) for _ in range(rows)]`;
            }
            return `${input.name} = input()  # TODO: Add proper input parsing`;
        }).join('\n');

        const paramNames = this.inputStructure.map(i => i.name).join(', ');
        const functionCall = returnType !== 'None' 
            ? `result = ${this.functionName}(${paramNames})`
            : `${this.functionName}(${paramNames})`;

        // Generate output printing
        let outputPrinting = '';
        if (returnType !== 'None') {
            const output = this.outputStructure[0];
            if (output.type.includes('vector<vector')) {
                outputPrinting = `for row in result:\n    print(' '.join(map(str, row)))`;
            } else if (output.type.includes('vector')) {
                outputPrinting = `print(' '.join(map(str, result)))`;
            } else {
                outputPrinting = `print(result)`;
            }
        }

        return `${imports}
**Your Code Goes Here**

if __name__ == "__main__":
    ${inputReading}
    
    ${functionCall}
    
    ${outputPrinting}`;
    }

    
    generateJavaScriptFullBoilerplate(): string {
        const returnType = this.outputStructure.length === 1 
            ? this.mapTypeToJavaScript(this.outputStructure[0].type) 
            : 'void';
        
        const params = this.inputStructure.map(i => i.name).join(', ');

        // Generate input reading
        const inputReading = this.inputStructure.map((input, idx) => {
            if (input.type === 'int' || input.type === 'long' || input.type === 'float' || input.type === 'double') {
                return `const ${input.name} = parseInt(lines[${idx}]);`;
            } else if (input.type === 'string') {
                return `const ${input.name} = lines[${idx}];`;
            } else if (input.type === 'vector<int>') {
                return `const ${input.name} = lines[${idx}].split(' ').map(Number);`;
            } else if (input.type === 'vector<string>') {
                return `const ${input.name} = lines[${idx}].split(' ');`;
            } else if (input.type === 'vector<vector<int>>') {
                return `const rows = parseInt(lines[${idx}]);\nconst ${input.name} = [];\nfor(let i = 0; i < rows; i++) {\n    ${input.name}.push(lines[${idx + 1} + i].split(' ').map(Number));\n}`;
            }
            return `const ${input.name} = lines[${idx}];`;
        }).join('\n');

        const paramNames = this.inputStructure.map(i => i.name).join(', ');
        const functionCall = returnType !== 'void' 
            ? `const result = ${this.functionName}(${paramNames});`
            : `${this.functionName}(${paramNames});`;

        // Generate output printing
        let outputPrinting = '';
        if (returnType !== 'void') {
            const output = this.outputStructure[0];
            if (output.type.includes('vector<vector')) {
                outputPrinting = `result.forEach(row => console.log(row.join(' ')));`;
            } else if (output.type.includes('vector')) {
                outputPrinting = `console.log(result.join(' '));`;
            } else {
                outputPrinting = `console.log(result);`;
            }
        }

        return `**Your Code Goes Here**

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
}).on('close', () => {
    ${inputReading}
    
    ${functionCall}
    
    ${outputPrinting}
});`;
    }

    
    generateJavaFullBoilerplate(): string {
        const returnType = this.outputStructure.length === 1 
            ? this.mapTypeToJava(this.outputStructure[0].type) 
            : 'void';
        
        const params = this.inputStructure.map(i => 
            `${this.mapTypeToJava(i.type)} ${i.name}`
        ).join(', ');

        // Generate input reading
        const inputReading = this.inputStructure.map(input => {
            if (input.type === 'int') {
                return `        int ${input.name} = scanner.nextInt();`;
            } else if (input.type === 'long') {
                return `        long ${input.name} = scanner.nextLong();`;
            } else if (input.type === 'float' || input.type === 'double') {
                return `        double ${input.name} = scanner.nextDouble();`;
            } else if (input.type === 'string') {
                return `        String ${input.name} = scanner.next();`;
            } else if (input.type === 'vector<int>') {
                return `        int n_${input.name} = scanner.nextInt();\n        int[] ${input.name} = new int[n_${input.name}];\n        for(int i = 0; i < n_${input.name}; i++) ${input.name}[i] = scanner.nextInt();`;
            } else if (input.type === 'vector<string>') {
                return `        int n_${input.name} = scanner.nextInt();\n        String[] ${input.name} = new String[n_${input.name}];\n        for(int i = 0; i < n_${input.name}; i++) ${input.name}[i] = scanner.next();`;
            } else if (input.type === 'vector<vector<int>>') {
                return `        int rows_${input.name} = scanner.nextInt();\n        int cols_${input.name} = scanner.nextInt();\n        int[][] ${input.name} = new int[rows_${input.name}][cols_${input.name}];\n        for(int i = 0; i < rows_${input.name}; i++)\n            for(int j = 0; j < cols_${input.name}; j++)\n                ${input.name}[i][j] = scanner.nextInt();`;
            }
            return `        // TODO: Read ${input.name}`;
        }).join('\n');

        const paramNames = this.inputStructure.map(i => i.name).join(', ');
        const functionCall = returnType !== 'void' 
            ? `${returnType} result = ${this.functionName}(${paramNames});`
            : `${this.functionName}(${paramNames});`;

        // Generate output printing
        let outputPrinting = '';
        if (returnType !== 'void') {
            const output = this.outputStructure[0];
            if (output.type === 'vector<int>' || output.type === 'int[]') {
                outputPrinting = `        for(int x : result) System.out.print(x + " ");\n        System.out.println();`;
            } else if (output.type === 'vector<string>' || output.type === 'String[]') {
                outputPrinting = `        for(String x : result) System.out.print(x + " ");\n        System.out.println();`;
            } else if (output.type === 'vector<vector<int>>' || output.type === 'int[][]') {
                outputPrinting = `        for(int[] row : result) {\n            for(int x : row) System.out.print(x + " ");\n            System.out.println();\n        }`;
            } else {
                outputPrinting = `        System.out.println(result);`;
            }
        }

        return `import java.util.*;

public class Solution {
    // ========== YOUR CODE GOES HERE ==========
    public static ${returnType} ${this.functionName}(${params}) {
        // Write your solution here
        ${returnType !== 'void' ? `return ${this.getDefaultValue(returnType)};` : ''}
    }
    // ========== END OF YOUR CODE ==========
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
${inputReading}
        
        ${functionCall}
        
${outputPrinting}
        
        scanner.close();
    }
}`;
    }

    private mapTypeToPython(cppType: string): string {
        const mapping: Record<string, string> = {
            'int': 'int',
            'long': 'int',
            'float': 'float',
            'double': 'float',
            'string': 'str',
            'bool': 'bool',
            'vector<int>': 'List[int]',
            'vector<string>': 'List[str]',
            'vector<vector<int>>': 'List[List[int]]',
        };
        return mapping[cppType] || cppType;
    }

    private mapTypeToJavaScript(cppType: string): string {
        const mapping: Record<string, string> = {
            'int': 'number',
            'long': 'number',
            'float': 'number',
            'double': 'number',
            'string': 'string',
            'bool': 'boolean',
            'vector<int>': 'number[]',
            'vector<string>': 'string[]',
            'vector<vector<int>>': 'number[][]',
        };
        return mapping[cppType] || cppType;
    }

    private mapTypeToJava(cppType: string): string {
        const mapping: Record<string, string> = {
            'int': 'int',
            'long': 'long',
            'float': 'float',
            'double': 'double',
            'string': 'String',
            'bool': 'boolean',
            'vector<int>': 'int[]',
            'vector<string>': 'String[]',
            'vector<vector<int>>': 'int[][]',
        };
        return mapping[cppType] || cppType;
    }

    private getDefaultValue(javaType: string): string {
        if (javaType === 'int' || javaType === 'long' || javaType === 'float' || javaType === 'double') {
            return '0';
        } else if (javaType === 'boolean') {
            return 'false';
        } else {
            return 'null';
        }
    }
}

if (require.main === module) {
    const sampleStructure = `
Problem Name: **Two Sum**
Function Name: twoSum
Input Structure:
Input Field: vector<int> nums
Input Field: int target
Output Structure:
Output Field: vector<int> result
    `.trim();

    const parser = new FullDefinitionParser();
    parser.parse(sampleStructure);

    console.log('========== C++ Full Boilerplate ==========');
    console.log(parser.generateCppFullBoilerplate());
    
    console.log('\n========== Python Full Boilerplate ==========');
    console.log(parser.generatePythonFullBoilerplate());
    
    console.log('\n========== JavaScript Full Boilerplate ==========');
    console.log(parser.generateJavaScriptFullBoilerplate());
    
    console.log('\n========== Java Full Boilerplate ==========');
    console.log(parser.generateJavaFullBoilerplate());
}