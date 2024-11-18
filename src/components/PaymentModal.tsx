import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [isPaying, setIsPaying] = useState(false);
  const PRICE = '49.99';

  const handleDownload = async () => {
    try {
      const response = await fetch('/download/project.zip');
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sales-management-system.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Purchase Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">What's included:</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Complete source code</li>
              <li>✓ Documentation</li>
              <li>✓ Free updates</li>
              <li>✓ 6 months support</li>
            </ul>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">${PRICE}</p>
            <p className="text-sm text-gray-500">One-time payment</p>
          </div>
        </div>

        <PayPalScriptProvider options={{
          "client-id": "AVjd8xtgovvTlIFhZvrFRFLBUUpkrvUa5vdFi_aJlsNP07ndhUkAYdEAeDCpBNtRFOq4muysgWlu3jZP",
          currency: "USD"
        }}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            disabled={isPaying}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: PRICE,
                      currency_code: "USD"
                    },
                    payee: {
                      email_address: "jntolxd@gmail.com"
                    },
                    description: "Sales Management System - Complete Package"
                  }
                ],
                application_context: {
                  shipping_preference: "NO_SHIPPING"
                }
              });
            }}
            onApprove={async (data, actions) => {
              setIsPaying(true);
              try {
                const details = await actions.order?.capture();
                if (details?.status === 'COMPLETED') {
                  toast.success('Payment successful! Starting download...');
                  handleDownload();
                }
              } catch (error) {
                console.error('Payment error:', error);
                toast.error('Payment failed. Please try again.');
              } finally {
                setIsPaying(false);
                onClose();
              }
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              toast.error('Payment failed. Please try again.');
              setIsPaying(false);
            }}
            onCancel={() => {
              toast.error('Payment cancelled');
              setIsPaying(false);
            }}
          />
        </PayPalScriptProvider>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Secure payment processed by PayPal
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;