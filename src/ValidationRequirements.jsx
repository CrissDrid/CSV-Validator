import React from 'react';
import { List, Typography, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

const ValidationRequirements = ({ validationResults }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'pending':
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getTextStyle = (status) => {
    switch (status) {
      case 'success':
        return { color: '#52c41a' };
      case 'error':
        return { color: '#f5222d' };
      case 'pending':
      default:
        return { color: '#faad14' };
    }
  };

  return (
    <List
      bordered
      dataSource={Object.entries(validationResults)}
      renderItem={([key, { status, message }]) => (
        <List.Item>
          <Space>
            {getIcon(status)}
            <Text style={getTextStyle(status)}>{message}</Text>
          </Space>
        </List.Item>
      )}
    />
  );
};

export default ValidationRequirements;