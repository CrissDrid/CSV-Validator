import React, { useState } from 'react';
import { Button, message } from 'antd';
import CSVUploadModal from './CSVUploadModal';

const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  const handleUpload = (file) => {
    // Aquí puedes procesar el archivo validado
    message.success(`Archivo ${file.name} subido exitosamente`);
    setModalVisible(false);
  };
  
  return (
    <div style={{ padding: 24 }}>
      <Button type="primary" onClick={handleOpenModal}>
        Importar CSV
      </Button>
      
      <CSVUploadModal 
        visible={modalVisible} 
        onCancel={handleCloseModal}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;