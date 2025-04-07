import React from 'react';
import { List, Typography, Space } from 'antd';
import { CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Text } = Typography;

const ValidationRequirements = ({ validationResults }) => {
  const getIcon = (status) => {
    switch (status) {
        case 'success':
            return <CheckCircleOutlined style={{ color: '#76C35E'}}/>
        case 'error':
            return <WarningOutlined style={{ color: '#f5222d'}}/>
        case 'pending':
            return <ExclamationCircleOutlined style={{ color: '#3287b2'}}/>
        default:
            return <ExclamationCircleOutlined style={{ color: '#3287b2'}}/>
    }
}

  return (
    <List
      bordered = {false}
      dataSource={Object.entries(validationResults)}
      renderItem={([key, { status, message }]) => (
        <List.Item style={{ border: 'none' }}>
          <Space>
            {getIcon(status)}
            <Text>{message}</Text>
          </Space>
        </List.Item>
      )}
    />
  );
};

export default ValidationRequirements;