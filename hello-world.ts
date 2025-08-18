/**
 * A simple hello world function that returns a greeting message
 * @param name - The name to greet (optional, defaults to "World")
 * @returns A greeting message
 */
function helloWorld(name: string = "World"): string {
    return `Hello, ${name}!`;
}

/**
 * Alternative arrow function implementation
 * @param name - The name to greet (optional, defaults to "World")
 * @returns A greeting message
 */
const helloWorldArrow = (name: string = "World"): string => {
    return `Hello, ${name}!`;
};

// Example usage
console.log(helloWorld()); // Output: Hello, World!
console.log(helloWorld("TypeScript")); // Output: Hello, TypeScript!
console.log(helloWorldArrow("Claude")); // Output: Hello, Claude!

export { helloWorld, helloWorldArrow };