// Test TypeScript file with intentional syntax errors
function testFunction(): string {
    let x: number = "this should be a number"; // Type error
    const y = 5;
    return x + y; // Another type error
    console.log("unreachable code");
}