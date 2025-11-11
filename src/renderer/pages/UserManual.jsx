import React from 'react';
import { Modal } from 'antd';

const userManualData = [
  { 
    q: "如何使用该软件？", 
    a: "点击“选择文件”按钮，选择文件并点击操作按钮即可。",
    img: ""
  },
  { 
    q: "遇到其他问题怎么办？", 
    a: "如果遇到其他问题，可以通过加入QQ群：735521320 ，或者发送邮件到 1378813463@qq.com 联系技术支持。",
    img: ""
  },
  { 
    q: "软件支持哪些操作系统？", 
    a: "该软件支持 Windows、macOS（正在开发中）操作系统。",
    img: ""
  },
  { 
    q: "为什么使用这些常用平台，每次都要登录？", 
    a: "目前软件的策略是关闭Tab会清除相关的Cookie等缓存信息，并且Tab之间不共享会话数据。",
    img: ""
  },
  { 
    q: "如何退出应用？", 
    a: "您可以点击右上角的关闭按钮，或者使用快捷键 `Ctrl+Q` 退出应用，或者在折叠菜单栏用右键-退出。",
    img: ""
  },
  { 
    q: "如何反馈建议或报告问题？", 
    a: "你可以加入QQ群：735521320 直接@群主提出问题或建议。必要的话后续会增加其他反馈渠道。",
    img: ""
  },
];

const UserManual = ({ visible, onClose }) => {
  return (
    <Modal
      title="用户手册"
      open={visible}
      onCancel={onClose}  // 关闭模态框时触发 onClose 回调
      footer={null}
      width={800}
      style={{ top: 30 }}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
        {userManualData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--background-secondary)',
              margin: '10px 0',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: 'var(--shadow-color)',
            }}
          >
            <h3 style={{ color: 'var(--primary-color)' }}>Q: {item.q}</h3>
            <p style={{ color: 'var(--text-color-secondary)' }}>A: {item.a}</p>
            {/* 条件渲染图片 */}
            {item.img && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <img
                  src={item.img}
                  alt={item.q} // 设置 alt 属性为问题描述
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default UserManual;
