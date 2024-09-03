import { Project } from "@/types/Project";
import { Artifact } from "@/types/Artifact";
import React from "react";
import ProjectOverview from "@/components/ProjectOverview";
import Header from "@/components/Header";

const createDummyArtifact = (name: string): Artifact => ({
  id: Math.random().toString(36).substr(2, 9),
  createdAt: new Date(),
  updatedAt: new Date(),
  name,
  prompt: "Dummy prompt",
  code: "console.log('Hello, World!');",
  dependencies: {},
  template: "default",
});

const dummyProjects: Project[] = [
  {
    id: "1",
    title: "AI Chatbot",
    description: "An intelligent chatbot powered by machine learning algorithms.",
    context: [],
    artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
    entrypoint: createDummyArtifact("Main"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-04-20"),
    createdBy: "user1",
    updatedBy: "user1",
    publishedUrl: "https://ai-chatbot.example.com",
    status: "Active",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "2",
    title: "Image Recognition App",
    description: "A mobile app that can identify objects in photos using computer vision.",
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
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "3",
    title: "Data Visualization Tool",
    description: "An interactive web application for creating stunning data visualizations.",
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
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "1",
    title: "AI Chatbot",
    description: "An intelligent chatbot powered by machine learning algorithms.",
    context: [],
    artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
    entrypoint: createDummyArtifact("Main"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-04-20"),
    createdBy: "user1",
    updatedBy: "user1",
    publishedUrl: "https://ai-chatbot.example.com",
    status: "Active",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "2",
    title: "Image Recognition App",
    description: "A mobile app that can identify objects in photos using computer vision.",
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
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "3",
    title: "Data Visualization Tool",
    description: "An interactive web application for creating stunning data visualizations.",
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
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "1",
    title: "AI Chatbot",
    description: "An intelligent chatbot powered by machine learning algorithms.",
    context: [],
    artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
    entrypoint: createDummyArtifact("Main"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-04-20"),
    createdBy: "user1",
    updatedBy: "user1",
    publishedUrl: "https://ai-chatbot.example.com",
    status: "Active",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "2",
    title: "Image Recognition App",
    description: "A mobile app that can identify objects in photos using computer vision.",
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
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "3",
    title: "Data Visualization Tool",
    description: "An interactive web application for creating stunning data visualizations.",
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
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "1",
    title: "AI Chatbot",
    description: "An intelligent chatbot powered by machine learning algorithms.",
    context: [],
    artifacts: [createDummyArtifact("Main"), createDummyArtifact("Utils")],
    entrypoint: createDummyArtifact("Main"),
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-04-20"),
    createdBy: "user1",
    updatedBy: "user1",
    publishedUrl: "https://ai-chatbot.example.com",
    status: "Active",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "2",
    title: "Image Recognition App",
    description: "A mobile app that can identify objects in photos using computer vision.",
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
    thumbnail: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: "3",
    title: "Data Visualization Tool",
    description: "An interactive web application for creating stunning data visualizations.",
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
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
      <Header />
      <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
        <div className="mx-auto w-full max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-800">
                Your Projects
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="bg-gray-100 text-gray-500 placeholder-gray-400 font-normal py-3 pl-10 pr-4 rounded-full transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 ease-in-out flex items-center space-x-2 shadow-md"
                  onClick={() => {/* Add your create project logic here */}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
            <div className="max-w-5xl mx-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {dummyProjects.map((project) => (
                  <ProjectOverview key={project.id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;