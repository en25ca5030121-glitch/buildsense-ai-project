import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      
      const storedId = localStorage.getItem('buildsense_selected_project_id');
      if (storedId) {
        const found = list.find((p) => p.id === Number(storedId));
        if (found) {
          setSelectedProject(found);
          return;
        }
      }
      if (list.length > 0 && !selectedProject) {
        setSelectedProject(list[0]);
      }
    } catch (err) {
      console.warn('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const selectProject = (project) => {
    setSelectedProject(project);
    if (project) {
      localStorage.setItem('buildsense_selected_project_id', project.id);
    } else {
      localStorage.removeItem('buildsense_selected_project_id');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject: selectProject,
        refreshProjects,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
