import React from 'react';

// 这是一个适配层，用于在 Web 环境下模拟 Taro 组件
// 当您真正迁移到 Taro 项目时，只需将导入路径改为 '@tarojs/components'

export const View: React.FC<any> = ({ children, className, onClick, style, ...props }) => (
  <div className={className} onClick={onClick} style={style} {...props}>{children}</div>
);

export const Text: React.FC<any> = ({ children, className, onClick, style, ...props }) => (
  <span className={className} onClick={onClick} style={style} {...props}>{children}</span>
);

export const Image: React.FC<any> = ({ src, className, mode, ...props }) => (
  <img src={src} className={className} referrerPolicy="no-referrer" {...props} />
);

export const ScrollView: React.FC<any> = ({ children, className, scrollY, ...props }) => (
  <div className={`${className} ${scrollY ? 'overflow-y-auto' : ''}`} {...props}>{children}</div>
);

export const Button: React.FC<any> = ({ children, className, onClick, ...props }) => (
  <button className={className} onClick={onClick} {...props}>{children}</button>
);

export const Textarea: React.FC<any> = ({ value, onInput, className, placeholder, ...props }) => (
  <textarea 
    value={value} 
    onChange={(e) => onInput && onInput(e)} 
    className={className} 
    placeholder={placeholder} 
    {...props} 
  />
);

export const Input: React.FC<any> = ({ value, onInput, className, placeholder, type = 'text', ...props }) => (
  <input 
    type={type}
    value={value} 
    onChange={(e) => onInput && onInput(e)} 
    className={className} 
    placeholder={placeholder} 
    {...props} 
  />
);
