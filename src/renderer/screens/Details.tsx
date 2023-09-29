import React from 'react';
import { Logo } from '../components/Logo';
import { BsPrinter } from 'react-icons/bs';

export default function Details({ order, setMode, mode, handlePrint }: any) {
  const MODES = {
    PREVIEW: 'preview',
    PRINT: 'print',
    NORMAL: 'normal',
  };
  return (
    <div className="h-screen w-screen flex flex-col p-7 gap-10">
      <div className="flex justify-between items-center">
        <Logo />
        {mode === MODES.PREVIEW && (
          <div className="flex flex-row gap-3 font-bold">
            <button
              className="bg-red-500 text-white p-3 rounded"
              onClick={() => setMode(MODES.NORMAL)}
            >
              Back
            </button>
            <button
              className="bg-green-500 text-white p-3 rounded flex justify-center items-center gap-2"
              onClick={() => handlePrint(order)}
            >
              <BsPrinter />
              Print
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 p-8 border flex-1 text-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-5">
            <span className="text-gray-500 w-1/12">Order</span>{' '}
            <strong>{order.id}</strong>
          </div>
          <div className="flex flex-row gap-5 ">
            <span className="text-gray-500  w-1/12">Name</span>
            <div className="flex flex-col">
              <strong>{`${order.json?.l_vorname} ${order.json?.l_nachname}`}</strong>
            </div>
          </div>
          <div className="flex flex-row gap-5 ">
            <span className="text-gray-500  w-1/12">Address</span>
            <div className="flex flex-col">
              <strong>{`${order.json?.l_adresse}`}</strong>
            </div>
          </div>
          <div className="flex flex-row gap-5">
            <span className="text-gray-500  w-1/12">Time</span>
            <strong>
              {Intl.DateTimeFormat('de-AT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(order.time)}
            </strong>
          </div>
          <div className="mt-1">
            <table className="w-full text-left mt-3">
              <thead className="">
                <tr className="hover:bg-gray-800 bg-gray-800">
                  <th>Name</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.bestell_zeilen.map((order_line: any) => (
                  <tr>
                    <td>{order_line.name}</td>
                    <td className="text-right">{order_line.preis}</td>
                    <td className="text-right">{order_line.menge}</td>
                    <td className="text-right">
                      {order_line.preis * order_line.menge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
