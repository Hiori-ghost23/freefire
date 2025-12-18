import React from 'react';

export interface OrderSummaryData {
  subtotal: number;
  itemCount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderSummaryProps {
  data: OrderSummaryData;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ data }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>
      
      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">
            Sous-total ({data.itemCount} article{data.itemCount > 1 ? 's' : ''})
          </span>
          <span className="font-medium">{data.subtotal.toLocaleString()},00 XOF</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Livraison</span>
          {data.shipping === 0 ? (
            <span className="font-medium text-green-400">Gratuite</span>
          ) : (
            <span className="font-medium">{data.shipping.toLocaleString()},00 XOF</span>
          )}
        </div>
        
        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">TVA</span>
          <span className="font-medium">{data.tax.toLocaleString()},00 XOF</span>
        </div>
        
        {/* Divider */}
        <hr className="border-white/10" />
        
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold">{data.total.toLocaleString()},00</span>
            <span className="text-lg text-neutral-400 ml-1">XOF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
