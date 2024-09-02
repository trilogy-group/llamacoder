export const generateCodePrompt = (prompt: string, fileContext: string, apiSpec: string) => {
    let formattedPrompt = `
${prompt}

Use these APIs wherever needed: (Use the server url mentioned in the api_docs itself)
<api_docs>
${apiSpec}
</api_docs>
`;
    if (fileContext) {
        formattedPrompt = `${formattedPrompt}\n\Here are some relevant content you may need to use (Please use them wherever appropriate):
<relevant_content>
${fileContext} 
</relevant_content>
`;
    }
    return formattedPrompt;
}

export const modifyCodePrompt = (initialPrompt: string, prompt: string, code: string, fileContext: string, apiSpec: string) => {
    var prompt = `
I am trying to build a react component which looks beautiful and works end to end. Here is the overview of what I want to build:
<overview>
${initialPrompt}
</overview>

So far I have this for the react component:
<code>
${code}
</code>

**IMPORTANT**: I want to make following changes to this code:
<required_changes>
${prompt}
</required_changes>

Use these APIs wherever needed: (Use the server url mentioned in the api_docs itself)
<api_docs>
${apiSpec}
</api_docs>
`;
    if (fileContext !== "") {
        prompt = `${prompt}\n\Here are some relevant content you may need to use (Please use them wherever appropriate):
<relevant_content>
${fileContext} 
</relevant_content>
`;
    }
    return prompt;
}