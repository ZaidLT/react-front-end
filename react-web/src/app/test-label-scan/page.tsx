'use client';

import React, { useState } from 'react';
import { scanProductLabel, LabelScanResult } from '../../util/labelScanning';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors, Typography } from '../../styles';

const TestLabelScanPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<LabelScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleLabelScan = async (file: File) => {
    try {
      setIsScanning(true);
      setError(null);
      setScanResult(null);
      setSelectedFile(file);
      
      console.log('Starting label scan test for:', file.name);
      
      const result = await scanProductLabel(file);
      
      if (result.success && result.data) {
        setScanResult(result.data);
        console.log('Scan successful:', result.data);
      } else {
        setError(result.error || 'Unknown error');
        console.error('Scan failed:', result.error);
      }
    } catch (error) {
      console.error('Error during label scan:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    }}>
      <h1 style={{
        fontSize: Typography.FONT_SIZE_24,
        fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
        color: Colors.BLUE,
        marginBottom: '20px',
      }}>
        Test Label Scanning with OpenAI
      </h1>

      <div style={{
        border: `2px dashed ${Colors.LIGHT_GREY}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        marginBottom: '20px',
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleLabelScan(e.target.files[0]);
            }
          }}
          style={{
            marginBottom: '20px',
            padding: '10px',
            border: `1px solid ${Colors.LIGHT_GREY}`,
            borderRadius: '8px',
          }}
        />
        
        <p style={{
          fontSize: Typography.FONT_SIZE_14,
          color: Colors.GREY_COLOR,
          margin: '10px 0',
        }}>
          Select an image of a product label to test OpenAI extraction
        </p>

        {isScanning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            margin: '20px 0',
          }}>
            <LoadingSpinner size={20} color={Colors.BLUE} />
            <span style={{ color: Colors.BLUE }}>Scanning label...</span>
          </div>
        )}
      </div>

      {selectedFile && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: `1px solid ${Colors.BLUE}`,
        }}>
          <h3 style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            color: Colors.BLUE,
            marginBottom: '10px',
          }}>
            Selected File
          </h3>
          <p><strong>Name:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {selectedFile.type}</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          border: '1px solid #f44336',
          marginBottom: '20px',
        }}>
          <h3 style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            color: '#f44336',
            marginBottom: '10px',
          }}>
            Error
          </h3>
          <p style={{ color: '#f44336' }}>{error}</p>
        </div>
      )}

      {scanResult && (
        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #4caf50',
        }}>
          <h3 style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: '#4caf50',
            marginBottom: '15px',
          }}>
            Extraction Results
          </h3>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <strong>Brand:</strong> {scanResult.brand || 'Not found'}
            </div>
            <div>
              <strong>Product Name:</strong> {scanResult.productName || 'Not found'}
            </div>
            <div>
              <strong>Model Number:</strong> {scanResult.modelNumber || 'Not found'}
            </div>
            <div>
              <strong>Serial Number:</strong> {scanResult.serialNumber || 'Not found'}
            </div>
          </div>

          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}>
            <strong>Raw JSON:</strong>
            <pre style={{
              fontSize: Typography.FONT_SIZE_12,
              margin: '5px 0 0 0',
              whiteSpace: 'pre-wrap',
            }}>
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        border: '1px solid #ff9800',
      }}>
        <h3 style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
          color: '#ff9800',
          marginBottom: '10px',
        }}>
          Instructions
        </h3>
        <ul style={{ color: '#ff9800', paddingLeft: '20px' }}>
          <li>Upload an image of a product label (appliance, electronics, etc.)</li>
          <li>The system will use OpenAI to extract brand, product name, model number, and serial number</li>
          <li>Results will be displayed below</li>
          <li>Check the browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default TestLabelScanPage;
