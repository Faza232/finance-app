// src/components/TransactionList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransactionModal from './TransactionModal';
import FormatDate from '../utils/FormatDate';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTransactions();
    }
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');  // Hapus token dari localStorage
    navigate('/login');  // Arahkan pengguna ke halaman login
  };

  const handleCreate = async (formData) => {
    try {
      const response = await axios.post('/api/transactions', formData);
      setTransactions([...transactions, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await axios.put(`/api/transactions/${editingTransaction.id}`, formData);
      const updatedTransactions = transactions.map((t) =>
        t.id === editingTransaction.id ? response.data : t
      );
      setTransactions(updatedTransactions);
      setEditingTransaction(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      const updatedTransactions = transactions.filter((t) => t.id !== id);
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const openModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Daftar Transaksi</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Logout
        </button>
      <button
        onClick={() => openModal()}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4">
        Tambah Transaksi
      </button>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Tanggal</th>
              <th className="py-2 px-4 border-b">Deskripsi</th>
              <th className="py-2 px-4 border-b">Jenis Transaksi</th>
              <th className="py-2 px-4 border-b">Jumlah</th>
              <th className="py-2 px-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{FormatDate(transaction.tanggal)}</td>
                <td className="py-2 px-4 border-b">{transaction.deskripsi}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`inline-block px-2 py-1 rounded ${
                      transaction.jenis_transaksi === 'pendapatan'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.jenis_transaksi}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  {transaction.jenis_transaksi === 'pendapatan' ? '+' : '-'}
                  {transaction.jumlah.toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => openModal(transaction)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={closeModal}>
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={editingTransaction ? handleUpdate : handleCreate}
          onCancel={closeModal}
        />
      </TransactionModal>
    </div>
  );
};

export default TransactionList;