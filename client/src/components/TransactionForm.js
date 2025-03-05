// src/components/TransactionForm.js
import React, { useState } from 'react';

const TransactionForm = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    tanggal: transaction ? transaction.tanggal : '',
    deskripsi: transaction ? transaction.deskripsi : '',
    jenis_transaksi: transaction ? transaction.jenis_transaksi : 'pendapatan',
    jumlah: transaction ? transaction.jumlah : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tanggal</label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
        <input
          type="text"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
        <select
          name="jenis_transaksi"
          value={formData.jenis_transaksi}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="pendapatan">Pendapatan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Jumlah</label>
        <input
          type="number"
          name="jumlah"
          value={formData.jumlah}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          {transaction ? 'Update' : 'Tambah'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;