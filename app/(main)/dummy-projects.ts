import { Project } from "@/types/Project";
import { Artifact } from "@/types/Artifact";

const createDummyArtifact = (name: string): Artifact => ({
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
    name,
    prompt: "Dummy prompt",
    code: "console.log('Hello, World!');",
    dependencies: {},
    // template: "default",
    history: [],
});


export const dummyProjects: Project[] = [
    {
        id: "1",
        title: "AI Chatbot",
        description:
            "An intelligent chatbot powered by machine learning algorithms.",
        context: [],
        artifacts: [
            createDummyArtifact("Login"),
            createDummyArtifact("Signup"),
            createDummyArtifact("Home"),
            createDummyArtifact("About"),
            createDummyArtifact("Contact"),
            createDummyArtifact("Features"),
            createDummyArtifact("Dashboard"),
            createDummyArtifact("Landing Page"),
            createDummyArtifact("Profile"),
            createDummyArtifact("Video Player"),
            createDummyArtifact("Audio Player"),
            createDummyArtifact("Calculator"),
            createDummyArtifact("Workspace"),
            createDummyArtifact("Chatbot"),
            createDummyArtifact("UI Viewer"),
            createDummyArtifact("Artifact"),
            createDummyArtifact("Analytics"),
            createDummyArtifact("Quicksight"),
            createDummyArtifact("Transcriber"),
            createDummyArtifact("Main"),
            createDummyArtifact("Utils"),
        ],
        entrypoint: createDummyArtifact("Main"),
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2023-04-20"),
        createdBy: "user1",
        updatedBy: "user1",
        publishedUrl: "https://ai-chatbot.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "2",
        title: "Image Recognition App",
        description:
            "A mobile app that can identify objects in photos using computer vision.",
        context: [],
        artifacts: [
            createDummyArtifact("ImageProcessor"),
            createDummyArtifact("UI"),
        ],
        entrypoint: createDummyArtifact("UI"),
        createdAt: new Date("2023-02-28"),
        updatedAt: new Date("2023-05-10"),
        createdBy: "user2",
        updatedBy: "user2",
        publishedUrl: "",
        status: "In Development",
        thumbnail:
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "3",
        title: "Data Visualization Tool",
        description:
            "An interactive web application for creating stunning data visualizations.",
        context: [],
        artifacts: [
            createDummyArtifact("DataLoader"),
            createDummyArtifact("Visualizer"),
        ],
        entrypoint: createDummyArtifact("Visualizer"),
        createdAt: new Date("2023-03-10"),
        updatedAt: new Date("2023-05-15"),
        createdBy: "user3",
        updatedBy: "user3",
        publishedUrl: "https://data-viz-tool.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "1",
        title: "AI Chatbot",
        description:
            "An intelligent chatbot powered by machine learning algorithms.",
        context: [],
        artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
        entrypoint: createDummyArtifact("Main"),
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2023-04-20"),
        createdBy: "user1",
        updatedBy: "user1",
        publishedUrl: "https://ai-chatbot.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "2",
        title: "Image Recognition App",
        description:
            "A mobile app that can identify objects in photos using computer vision.",
        context: [],
        artifacts: [
            createDummyArtifact("ImageProcessor"),
            createDummyArtifact("UI"),
        ],
        entrypoint: createDummyArtifact("UI"),
        createdAt: new Date("2023-02-28"),
        updatedAt: new Date("2023-05-10"),
        createdBy: "user2",
        updatedBy: "user2",
        publishedUrl: "",
        status: "In Development",
        thumbnail:
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "3",
        title: "Data Visualization Tool",
        description:
            "An interactive web application for creating stunning data visualizations.",
        context: [],
        artifacts: [
            createDummyArtifact("DataLoader"),
            createDummyArtifact("Visualizer"),
        ],
        entrypoint: createDummyArtifact("Visualizer"),
        createdAt: new Date("2023-03-10"),
        updatedAt: new Date("2023-05-15"),
        createdBy: "user3",
        updatedBy: "user3",
        publishedUrl: "https://data-viz-tool.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "1",
        title: "AI Chatbot",
        description:
            "An intelligent chatbot powered by machine learning algorithms.",
        context: [],
        artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
        entrypoint: createDummyArtifact("Main"),
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2023-04-20"),
        createdBy: "user1",
        updatedBy: "user1",
        publishedUrl: "https://ai-chatbot.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "2",
        title: "Image Recognition App",
        description:
            "A mobile app that can identify objects in photos using computer vision.",
        context: [],
        artifacts: [
            createDummyArtifact("ImageProcessor"),
            createDummyArtifact("UI"),
        ],
        entrypoint: createDummyArtifact("UI"),
        createdAt: new Date("2023-02-28"),
        updatedAt: new Date("2023-05-10"),
        createdBy: "user2",
        updatedBy: "user2",
        publishedUrl: "",
        status: "In Development",
        thumbnail:
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "3",
        title: "Data Visualization Tool",
        description:
            "An interactive web application for creating stunning data visualizations.",
        context: [],
        artifacts: [
            createDummyArtifact("DataLoader"),
            createDummyArtifact("Visualizer"),
        ],
        entrypoint: createDummyArtifact("Visualizer"),
        createdAt: new Date("2023-03-10"),
        updatedAt: new Date("2023-05-15"),
        createdBy: "user3",
        updatedBy: "user3",
        publishedUrl: "https://data-viz-tool.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "1",
        title: "AI Chatbot",
        description:
            "An intelligent chatbot powered by machine learning algorithms.",
        context: [],
        artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
        entrypoint: createDummyArtifact("Main"),
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2023-04-20"),
        createdBy: "user1",
        updatedBy: "user1",
        publishedUrl: "https://ai-chatbot.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "2",
        title: "Image Recognition App",
        description:
            "A mobile app that can identify objects in photos using computer vision.",
        context: [],
        artifacts: [
            createDummyArtifact("ImageProcessor"),
            createDummyArtifact("UI"),
        ],
        entrypoint: createDummyArtifact("UI"),
        createdAt: new Date("2023-02-28"),
        updatedAt: new Date("2023-05-10"),
        createdBy: "user2",
        updatedBy: "user2",
        publishedUrl: "",
        status: "In Development",
        thumbnail:
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
        id: "3",
        title: "Data Visualization Tool",
        description:
            "An interactive web application for creating stunning data visualizations.",
        context: [],
        artifacts: [
            createDummyArtifact("DataLoader"),
            createDummyArtifact("Visualizer"),
        ],
        entrypoint: createDummyArtifact("Visualizer"),
        createdAt: new Date("2023-03-10"),
        updatedAt: new Date("2023-05-15"),
        createdBy: "user3",
        updatedBy: "user3",
        publishedUrl: "https://data-viz-tool.example.com",
        status: "Active",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
];
