import React, { useState, useEffect } from 'react';
import { getAllProfileLink, getAllSkillLink } from '../../../../api/Decision_Link/Network_Call';

const MindMapView = ({ onNodeSelect }) => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedNodes, setExpandedNodes] = useState({
    root: true,
    swot_group: true,
    skills_group: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, skillRes] = await Promise.all([
          getAllProfileLink(),
          getAllSkillLink(),
        ]);
        setProfiles(profileRes.profiles || []);
        setSkills(skillRes.skills || []);
      } catch (err) {
        setError(err.message || 'Failed to load mind map data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleNode = (nodeKey) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const groupedProfiles = profiles.reduce((acc, item) => {
    const key = `${item.header_name} - ${item.header_value}`;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        type: item.header_name,
        metadata: item,
        decisions: [],
      };
    }
    acc[key].decisions.push(item);
    return acc;
  }, {});

  const groupedSkills = skills.reduce((acc, item) => {
    const key = item.skill_name;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        metadata: item,
        decisions: [],
      };
    }
    acc[key].decisions.push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="mindmap-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="no-profile-data">{error}</div>;
  }

  return (
    <div className="mindmap-wrapper">
      <div className="mindmap-tree">
        <div className="mindmap-node root-node" onClick={() => toggleNode('root')}>
          <span className="node-icon">🧠</span>
          <strong>Decisions Overview</strong>
        </div>

        {expandedNodes.root && (
          <div className="mindmap-branches">
            <div className="mindmap-branch">
              <div
                className="mindmap-node category-node swot"
                onClick={() => toggleNode('swot_group')}
              >
                <span>SWOT Profiles ({Object.keys(groupedProfiles).length})</span>
                <span className="toggle-indicator">
                  {expandedNodes.swot_group ? '▾' : '▸'}
                </span>
              </div>

              {expandedNodes.swot_group && (
                <div className="mindmap-subbranches">
                  {Object.entries(groupedProfiles).map(([attrKey, group]) => {
                    const isExpanded = !!expandedNodes[`prof_${attrKey}`];
                    return (
                      <div key={attrKey} className="mindmap-attribute-block">
                        <div
                          className={`mindmap-node attribute-node swot-${group.type?.toLowerCase()}`}
                          onClick={() => {
                            toggleNode(`prof_${attrKey}`);
                            if (onNodeSelect) onNodeSelect(group.metadata);
                          }}
                        >
                          <div className="node-content">
                            <strong>{group.name}</strong>
                            <span className="badge">{group.decisions.length}</span>
                          </div>
                          <span className="toggle-indicator">
                            {isExpanded ? '▾' : '▸'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="mindmap-leaf-nodes">
                            {group.decisions.map((dec, idx) => (
                              <div
                                key={idx}
                                className="mindmap-node decision-node"
                                onClick={() => onNodeSelect && onNodeSelect(dec)}
                              >
                                🎯 {dec.decision_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mindmap-branch">
              <div
                className="mindmap-node category-node skills"
                onClick={() => toggleNode('skills_group')}
              >
                <span>Soft Skills ({Object.keys(groupedSkills).length})</span>
                <span className="toggle-indicator">
                  {expandedNodes.skills_group ? '▾' : '▸'}
                </span>
              </div>

              {expandedNodes.skills_group && (
                <div className="mindmap-subbranches">
                  {Object.entries(groupedSkills).map(([skillName, group]) => {
                    const isExpanded = !!expandedNodes[`skill_${skillName}`];
                    return (
                      <div key={skillName} className="mindmap-attribute-block">
                        <div
                          className="mindmap-node attribute-node skill-item"
                          onClick={() => {
                            toggleNode(`skill_${skillName}`);
                            if (onNodeSelect) onNodeSelect(group.metadata);
                          }}
                        >
                          <div className="node-content">
                            <strong>{skillName}</strong>
                            <span className="badge">{group.decisions.length}</span>
                          </div>
                          <span className="toggle-indicator">
                            {isExpanded ? '▾' : '▸'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="mindmap-leaf-nodes">
                            {group.decisions.map((dec, idx) => (
                              <div
                                key={idx}
                                className="mindmap-node decision-node"
                                onClick={() => onNodeSelect && onNodeSelect(dec)}
                              >
                                🎯 {dec.decision_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapView;