import React from "react";

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({ 
  text, 
  searchQuery, 
  className = "" 
}) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="search-highlight">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};