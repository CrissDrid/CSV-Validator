import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Typography, message, Popconfirm, Progress, Flex } from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { validateCSVFile } from './CSVValidator';
import ValidationRequirements from './ValidationRequirements';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const CSVUploadModal = ({ visible, onCancel, onUpload }) => {
  const [fileList, setFileList] = useState([]);
  const [validationResults, setValidationResults] = useState({
    isCSVExtension: { status: 'pending', message: 'El archivo debe tener extensión .csv' },
    isNotEmpty: { status: 'pending', message: 'El archivo no debe estar vacío' },
    hasNoEmptyRows: { status: 'pending', message: 'El archivo no debe tener filas vacías' },
    hasSemicolonSeparator: { status: 'pending', message: 'El archivo debe estar separado por punto y coma (;)' },
  });
  // Estado para controlar la vista de carga
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // Efecto para manejar el progreso cuando loading está activo
  useEffect(() => {
    let timer;
    if (loading && percent < 100) {
      timer = setInterval(() => {
        setPercent(prevPercent => {
          // Incrementamos aproximadamente 20% por segundo (100% en 5 segundos)
          const newPercent = prevPercent + 2;
          if (newPercent >= 100) {
            clearInterval(timer);
            // Pequeño delay para mostrar el 100% antes de cambiar a completado
            setTimeout(() => {
              setUploadComplete(true);
              // Mostrar mensaje de éxito
              message.success('Archivo importado correctamente');
              
              // IMPORTANTE: Ya NO llamamos a onUpload aquí para evitar cerrar el modal
              // Solo notificamos al componente padre sobre el archivo seleccionado
              // pero el modal se mantiene abierto
            }, 500);
            return 100;
          }
          return newPercent;
        });
      }, 100); // Actualizamos cada 100ms para un movimiento más fluido
    }
    return () => clearInterval(timer);
  }, [loading, percent, fileList]);
  
  const handleFileChange = async (info) => {
    // Actualizar la lista de archivos
    setFileList(info.fileList.slice(-1)); // Mantener solo el último archivo
    
    const file = info.file;
    
    // Si hay un archivo seleccionado, proceder con las validaciones inmediatamente
    if (file && file.originFileObj) {
      // Informar al usuario que las validaciones están en progreso
      message.loading({ content: 'Validando archivo...', key: 'validating' });
      
      try {
        // Reset validaciones
        const resetValidations = Object.keys(validationResults).reduce((acc, key) => {
          acc[key] = { ...validationResults[key], status: 'pending' };
          return acc;
        }, {});
        setValidationResults(resetValidations);
        
        // Ejecutar validaciones
        const results = await validateCSVFile(file.originFileObj);
        setValidationResults(results);
        
        // Determinar si todas las validaciones pasaron
        const allValid = Object.values(results).every(val => val.status === 'success');
        
        // Mostrar mensaje apropiado
        if (allValid) {
          message.success({ content: 'Archivo válido', key: 'validating' });
        } else {
          message.error({ content: 'Archivo inválido, revisa los requisitos', key: 'validating' });
        }
      } catch (error) {
        console.error('Error validando archivo:', error);
        message.error({ content: 'Error al validar el archivo', key: 'validating' });
      }
    } else if (info.fileList.length === 0) {
      // Si se eliminó el archivo, resetear las validaciones
      const resetValidations = Object.keys(validationResults).reduce((acc, key) => {
        acc[key] = { ...validationResults[key], status: 'pending' };
        return acc;
      }, {});
      setValidationResults(resetValidations);
    }
  };
  
  const isFileValid = Object.values(validationResults).every(
    result => result.status === 'success'
  );
  
  const draggerProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.csv',
    fileList,
    customRequest: ({ file, onSuccess }) => {
      // Simular una carga exitosa inmediatamente
      setTimeout(() => {
        onSuccess("ok", file);
      }, 0);
    },
    onChange: handleFileChange,
    onRemove: () => {
      setFileList([]);
      // Reset validaciones cuando el archivo es eliminado
      const resetValidations = Object.keys(validationResults).reduce((acc, key) => {
        acc[key] = { ...validationResults[key], status: 'pending' };
        return acc;
      }, {});
      setValidationResults(resetValidations);
    },
  };
  
  const handleConfirm = () => {
    if (fileList.length > 0 && isFileValid) {
      // Iniciar la carga
      setLoading(true);
      setPercent(0);
      setUploadComplete(false);
    }
  };
  
  const handleComplete = () => {
    // Aquí llamamos a onUpload cuando el usuario decide finalizar explícitamente
    if (fileList.length > 0) {
      onUpload(fileList[0]);
    }
    resetModal();
  };
  
  const resetModal = () => {
    // Limpiar el archivo y resetear validaciones
    setFileList([]);
    const resetValidations = Object.keys(validationResults).reduce((acc, key) => {
      acc[key] = { ...validationResults[key], status: 'pending' };
      return acc;
    }, {});
    setValidationResults(resetValidations);
    setLoading(false);
    setPercent(0);
    setUploadComplete(false);
    
    // Llamar a la función onCancel proporcionada por el componente padre
    onCancel();
  };
  
  // Renderizamos diferentes botones de cancelar dependiendo de si hay un archivo cargado
  const renderCancelButton = () => {
    if (loading) {
      // Si está cargando, no mostramos botón de cancelar
      return null;
    }
    
    if (fileList.length > 0) {
      // Si hay archivos, mostramos el Popconfirm
      return (
        <Popconfirm
          title="¿Estás seguro de cerrar?"
          description="Si cierras perderás los cambios realizados y el archivo cargado."
          onConfirm={resetModal}
          okText="Sí, cerrar"
          cancelText="No, continuar"
          placement="top"
        >
          <Button key="cancel">
            Cancelar
          </Button>
        </Popconfirm>
      );
    } else {
      // Si no hay archivos, simplemente cerramos el modal
      return (
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>
      );
    }
  };
  
  // Renderizamos el contenido del modal según el estado
  const renderContent = () => {
    if (loading) {
      return (
        <Flex vertical align="center" justify="center" style={{ padding: '40px 0' }}>
          {uploadComplete ? (
            <>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
              <Title level={4}>¡Archivo importado exitosamente!</Title>
              <Text type="secondary">El archivo CSV ha sido procesado correctamente.</Text>
            </>
          ) : (
            <>
              <Progress 
                type="circle" 
                percent={percent} 
                status={percent < 100 ? "active" : "success"} 
                style={{ marginBottom: 24 }}
              />
              <Text>Importando archivo, por favor espere...</Text>
            </>
          )}
        </Flex>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <Title level={5}>Selecciona un archivo CSV para importar</Title>
            <Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Haz clic o arrastra un archivo CSV a esta área
              </p>
              <p className="ant-upload-hint">
                Solo se permiten archivos en formato CSV
              </p>
            </Dragger>
          </div>
          
          <div>
            <Title level={5}>Requisitos del archivo</Title>
            <ValidationRequirements validationResults={validationResults} />
          </div>
        </div>
      );
    }
  };
  
  // Renderizamos los botones del footer según el estado
  const renderFooterButtons = () => {
    if (loading) {
      if (uploadComplete) {
        return [
          <Button key="close" type="primary" onClick={handleComplete}>
            Finalizar
          </Button>
        ];
      } else {
        // No mostramos botones durante la carga
        return null;
      }
    } else {
      return [
        renderCancelButton(),
        <Button
          key="submit"
          type="primary"
          disabled={!isFileValid || fileList.length === 0}
          onClick={handleConfirm}
        >
          Importar
        </Button>
      ];
    }
  };
  
  return (
    <Modal
      title={loading ? (uploadComplete ? "Importación Completada" : "Importando Archivo") : "Importar archivo CSV"}
      open={visible}
      onCancel={loading || fileList.length > 0 ? null : onCancel} // Desactivamos el cierre del modal con 'X' cuando hay archivo o está cargando
      width={700}
      maskClosable={!loading && fileList.length === 0} // No permitir cerrar al hacer clic fuera si hay un archivo o está cargando
      closable={!loading} // No mostrar el botón X durante la carga
      footer={renderFooterButtons()}
    >
      {renderContent()}
    </Modal>
  );
};

export default CSVUploadModal;