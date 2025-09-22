'use client';

import Big from 'big.js';
import { useEffect, useState } from 'react';
import { ChartDatum } from '../store/chartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTransactionData } from '../store/transactionSlice';

function validateInput(input: string) {
  if (input.length == 0) {
    return;
  }

  const noDots = input.replace(/\./g, '');
  const isFloat = /^\d*(\.\d+)?$/.test(noDots); // no - or + allowed
  if (isFloat) {
    return noDots;
  }

  return null;
}

export default function TransactionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const chartData: ChartDatum[] = useAppSelector((state) => state.chart.data);

  const [price, setPrice] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState('');
  const [priceCleared, setPriceCleared] = useState(false);
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [amountCleared, setAmountCleared] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (chartData.length == 0) {
      return;
    }

    const chartDatum = chartData[chartData.length - 1];
    const cost = chartDatum.priceUsd;

    console.log(chartDatum);
    console.log(cost);
    if (price === '' && amount !== '') {
      try {
        setCalculatedPrice(new Big(cost).mul(amount).toString());
      } catch (error) {
        setCalculatedPrice('');
        return;
      }
    }
    if (amount === '' && price !== '') {
      try {
        setCalculatedAmount(new Big(price).div(cost).toString());
      } catch (error) {
        setCalculatedAmount('');
      }
    }
  }, [price, amount]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPrice(val);
    if (val === '') {
      setPriceCleared(true);
    } else {
      setPriceCleared(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    if (val === '') {
      setAmountCleared(true);
    } else {
      setAmountCleared(false);
    }
  };

  const handleSubmit = (type: 'Buy' | 'Sell') => {
    const priceValidated = validateInput(price);
    const amountValidated = validateInput(amount);

    if (!priceValidated || !amountValidated) {
      setError(
        'Please enter valid numbers in format: 123,456.0001 whereas , is delimiter for tausend and will be ignored.',
      );
      return;
    }

    dispatch(
      addTransactionData({
        time: Date.now(),
        priceUsd: priceValidated,
        amountAsset: amountValidated,
        type,
      }),
    );

    setPrice('');
    setAmount('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-80">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="ounded-full cursor-pointer" aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center mb-2 input-root">
          <input
            type="text"
            placeholder="Price (USD)"
            value={price === '' && !priceCleared ? calculatedPrice : price}
            onChange={handlePriceChange}
            onBlur={() => (price === '' ? setPriceCleared(false) : null)}
            className="flex-1"
          />
          <span className="">USD</span>
        </div>
        <div className="flex items-center mb-2 input-root">
          <input
            type="text"
            placeholder="Amount (BTC)"
            value={amount === '' && !amountCleared ? calculatedAmount : amount}
            onChange={handleAmountChange}
            onBlur={() => (amount === '' ? setAmountCleared(false) : null)}
            className="flex-1"
          />
          <span className="">BTC</span>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => handleSubmit('Buy')}
            className="primary-button-color py-2 px-4 mr-2 rounded  cursor-pointer w-full"
          >
            Buy
          </button>
          <button
            onClick={() => handleSubmit('Sell')}
            className="primary-button-color py-2 px-4 ml-2 rounded  cursor-pointer w-full"
          >
            Sell
          </button>
        </div>

        {error && <p className="text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
