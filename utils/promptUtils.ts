export const generateCodePrompt = (prompt: string, fileContext: string) => {
    if(fileContext === "") return prompt;
    return `
${prompt}
      
Use these relevant info wherever needed:
<relevant_info>
${fileContext}
</relevant_info>
`;
}

export const modifyCodePrompt = (initialPrompt: string, prompt: string, activeComponent: string, activeFileContent: string, availableComponents: string[], fileContext: string) => {
    var prompt = `
You are helping me build a full fledged web application. Here is the overview of the application:
<overview>
${initialPrompt}
</overview>

Note: 
- Do not use 'App' as any component's name. It is a reserved keyword in my workspace.
- You should always return the complete code for a component irrespective of whether you are updating the given component or creating a new one.

<custom_components>
We have these custom components that you can use in your code:
${availableComponents.map(component => `  - <${component}>`).join('\n')}

Please use these components where appropriate in your code.
Make sure you import them before using them. A custom component can be imported like this:
import MyCustomComponent from "./MyCustomComponent";

Replace the component name with the actual component name.
</custom_components>

<required_changes>
I want you to make the following changes:
${prompt}

Note: This may require you to either modify the code given below or create new components.

Here is the component I am currently working on (You will have to either modify this or create a new component):
<${activeComponent}>
${activeFileContent}
</${activeComponent}>

Ensure you do not change the component name. Either modify the code given below or create a new component.
If you choose to create a new component, make sure you do not use name of any custom components provided above.
</required_changes>

Note: No component name should be 'App'. It is a reserved keyword in my workspace.
`;
    if (fileContext !== "") {
      prompt = `${prompt}\n\Here are some relevant content you may need to use (Please use them wherever appropriate):
  ${fileContext} 
`;
    }
    return prompt;
}