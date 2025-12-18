'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Smartphone, 
  Globe, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  FileImage,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder, useCheckout, useUploadProof } from '@/lib/hooks/api-hooks';

// Payment methods by country (based on backend configuration)
const paymentConfig = {
  BJ: {
    name: 'Bénin',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  CI: {
    name: 'Côte d\'Ivoire',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  TG: {
    name: 'Togo',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  BF: {
    name: 'Burkina Faso',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  ML: {
    name: 'Mali',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  NE: {
    name: 'Niger',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  SN: {
    name: 'Sénégal',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
      { id: 'moov_money', name: 'Moov Money', type: 'mobile_money', icon: Smartphone },
    ]
  },
  GW: {
    name: 'Guinée-Bissau',
    currency: 'XOF',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
    ]
  },
  NG: {
    name: 'Nigeria',
    currency: 'NGN',
    methods: [
      { id: 'mtn_momo', name: 'MTN MoMo', type: 'mobile_money', icon: Smartphone },
    ]
  },
  FR: {
    name: 'France',
    currency: 'EUR',
    methods: [
      { id: 'remitly', name: 'Remitly', type: 'international_transfer', icon: Globe },
      { id: 'worldremit', name: 'WorldRemit', type: 'international_transfer', icon: Globe },
      { id: 'western_union', name: 'Western Union', type: 'international_transfer', icon: Globe },
      { id: 'ria', name: 'RIA Money Transfer', type: 'international_transfer', icon: Globe },
      { id: 'moneygram', name: 'MoneyGram', type: 'international_transfer', icon: Globe },
      { id: 'taptap_send', name: 'Taptap Send', type: 'international_transfer', icon: Globe },
    ]
  },
};

interface PaymentFormData {
  country: string;
  method: string;
  phone: string;
  reference: string;
  amount: number;
  proof?: File;
}

interface CheckoutCart {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
}

export default function PaymentPage() {
  const { state: authState } = useAuth();
  const createOrderMutation = useCreateOrder();
  const checkoutMutation = useCheckout();
  const uploadProofMutation = useUploadProof();
  
  const [step, setStep] = useState(1); // 1: Selection, 2: Details, 3: Proof, 4: Confirmation
  const [formData, setFormData] = useState<PaymentFormData>({
    country: '',
    method: '',
    phone: '',
    reference: '',
    amount: 0,
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutCart, setCheckoutCart] = useState<CheckoutCart | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  // Load checkout cart from localStorage
  useEffect(() => {
    const cartData = localStorage.getItem('checkout_cart');
    if (cartData) {
      try {
        setCheckoutCart(JSON.parse(cartData));
      } catch {
        router.push('/cart');
      }
    } else {
      router.push('/cart');
    }
  }, [router]);

  // Get user for AppLayout
  const user = authState.user ? {
    id: String(authState.user.id),
    email: authState.user.email,
    display_name: authState.user.display_name || authState.user.email?.split('@')[0] || 'Utilisateur',
    role: authState.user.role as 'user' | 'admin' | 'organizer',
  } : null;

  const selectedCountryConfig = formData.country ? paymentConfig[formData.country as keyof typeof paymentConfig] : null;
  const selectedMethod = selectedCountryConfig?.methods.find(m => m.id === formData.method);

  const handleCountryChange = (country: string) => {
    setFormData((prev: PaymentFormData) => ({ ...prev, country, method: '' }));
  };

  const handleMethodChange = (method: string) => {
    setFormData((prev: PaymentFormData) => ({ ...prev, method }));
  };

  const handleFileUpload = (event: { target: { files: FileList | null } }) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast({
          type: 'error',
          title: 'Fichier trop volumineux',
          message: 'Le fichier ne doit pas dépasser 5MB.',
        });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        addToast({
          type: 'error',
          title: 'Format non supporté',
          message: 'Seuls les formats JPG, PNG, GIF et PDF sont acceptés.',
        });
        return;
      }

      setProofFile(file);
      addToast({
        type: 'success',
        title: 'Fichier ajouté',
        message: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!proofFile || !paymentId) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez télécharger une preuve de paiement.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload proof of payment
      await uploadProofMutation.mutateAsync({
        paymentId,
        file: proofFile,
      });
      
      // Clear cart from localStorage
      localStorage.removeItem('checkout_cart');
      localStorage.removeItem('freefire_cart');
      
      addToast({
        type: 'success',
        title: 'Paiement enregistré',
        message: 'Votre paiement est en cours de vérification. Vous recevrez une confirmation sous 24h.',
      });
      
      // Redirect to profile/orders
      router.push('/profile?tab=history');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      addToast({
        type: 'error',
        title: 'Erreur de paiement',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create order and initiate checkout when moving to step 3
  const handleProceedToPaymentDetails = async () => {
    if (!checkoutCart || !authState.user) {
      addToast({
        type: 'error',
        message: 'Veuillez vous connecter pour continuer.',
      });
      router.push('/login');
      return;
    }

    try {
      // Create order for the first item (simplified - in real app, handle multiple items)
      const firstItem = checkoutCart.items[0];
      if (!firstItem) {
        throw new Error('Panier vide');
      }

      const orderResponse = await createOrderMutation.mutateAsync({
        catalog_item_id: firstItem.id,
        uid_freefire: authState.user.uid_freefire || '',
        quantity: firstItem.quantity,
      });

      setOrderCode(orderResponse.code);

      // Initiate checkout
      const checkoutResponse = await checkoutMutation.mutateAsync({
        order_code: orderResponse.code,
        method: formData.method,
        phone: formData.phone || undefined,
      });

      setPaymentId(checkoutResponse.payment_id || checkoutResponse.id);
      setStep(4);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la commande.';
      addToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage,
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'XOF') return `${amount.toLocaleString()} XOF`;
    if (currency === 'EUR') return `${(amount / 655.957).toFixed(2)} €`;
    if (currency === 'NGN') return `${(amount * 0.65).toFixed(0)} ₦`;
    return `${amount} ${currency}`;
  };

  // Use checkout cart data or fallback
  const orderData = checkoutCart ? {
    items: checkoutCart.items.map(item => ({ name: item.name, price: item.price * item.quantity })),
    total: checkoutCart.total
  } : {
    items: [],
    total: 0
  };

  // Loading state
  if (!checkoutCart) {
    return (
      <AppLayout user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Finaliser le paiement
            </h1>
            <p className="mt-2 text-neutral-400">
              Choisissez votre méthode de paiement et téléchargez votre preuve
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h2 className="text-lg font-semibold text-white mb-6">Résumé de commande</h2>
                
                <div className="space-y-4 mb-6">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-neutral-400">{item.name}</span>
                      <span className="text-white">{item.price.toLocaleString()} XOF</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-primary">{orderData.total.toLocaleString()} XOF</span>
                  </div>
                  
                  {selectedCountryConfig && (
                    <div className="mt-2 text-sm text-neutral-400">
                      ≈ {formatCurrency(orderData.total, selectedCountryConfig.currency)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="card">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNum
                          ? 'bg-primary text-white'
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                      </div>
                      {stepNum < 4 && (
                        <div className={`w-16 h-0.5 mx-2 ${
                          step > stepNum ? 'bg-primary' : 'bg-neutral-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Country Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Choisissez votre pays</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(paymentConfig).map(([code, config]) => (
                        <button
                          key={code}
                          onClick={() => handleCountryChange(code)}
                          className={`p-4 rounded-lg border transition-colors text-left ${
                            formData.country === code
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm opacity-70">{config.currency}</div>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.country}
                      className="w-full"
                    >
                      Continuer
                    </Button>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && selectedCountryConfig && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Méthode de paiement</h2>
                      <p className="text-neutral-400 mt-1">
                        Paiement depuis {selectedCountryConfig.name}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedCountryConfig.methods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => handleMethodChange(method.id)}
                            className={`w-full p-4 rounded-lg border transition-colors text-left ${
                              formData.method === method.id
                                ? 'border-primary bg-primary/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium text-white">{method.name}</div>
                                <div className="text-sm text-neutral-400">
                                  {method.type === 'mobile_money' ? 'Paiement mobile' : 'Transfert international'}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Retour
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!formData.method}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Details */}
                {step === 3 && selectedMethod && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Détails du paiement</h2>
                      <p className="text-neutral-400 mt-1">
                        Paiement via {selectedMethod.name}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {selectedMethod.type === 'mobile_money' && (
                        <>
                          <div>
                            <Label htmlFor="phone">Numéro de téléphone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Ex: +229 12 34 56 78"
                              value={formData.phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: PaymentFormData) => ({ ...prev, phone: e.target.value }))}
                              className="mt-2"
                            />
                          </div>
                          
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-blue-300">
                                <p className="font-medium">Instructions de paiement:</p>
                                <ol className="mt-2 space-y-1 list-decimal list-inside">
                                  <li>Composez *555# sur votre téléphone</li>
                                  <li>Sélectionnez "Transfert d'argent"</li>
                                  <li>Entrez le montant: <span className="font-medium">{orderData.total.toLocaleString()} XOF</span></li>
                                  <li>Entrez le code marchand: <span className="font-medium">FF2024</span></li>
                                  <li>Confirmez avec votre code PIN</li>
                                  <li>Notez le numéro de référence</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedMethod.type === 'international_transfer' && (
                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-300">
                              <p className="font-medium">Instructions de transfert:</p>
                              <div className="mt-2 space-y-1">
                                <p><span className="font-medium">Destinataire:</span> FreeFire MVP</p>
                                <p><span className="font-medium">Montant:</span> {formatCurrency(orderData.total, selectedCountryConfig!.currency)}</p>
                                <p><span className="font-medium">Code de référence:</span> FF2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                                <p className="mt-2 text-xs opacity-90">
                                  Effectuez le transfert via {selectedMethod.name} et téléchargez le reçu ci-dessous.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="reference">Numéro de référence du paiement</Label>
                        <Input
                          id="reference"
                          type="text"
                          placeholder="Ex: MP201224001234"
                          value={formData.reference}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: PaymentFormData) => ({ ...prev, reference: e.target.value }))}
                          className="mt-2"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Le numéro de référence fourni par votre opérateur après le paiement
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Retour
                      </Button>
                      <Button
                        onClick={handleProceedToPaymentDetails}
                        disabled={!formData.reference || createOrderMutation.isPending || checkoutMutation.isPending}
                        className="flex-1"
                      >
                        {(createOrderMutation.isPending || checkoutMutation.isPending) ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                            Traitement...
                          </>
                        ) : (
                          'Continuer'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Upload Proof */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Preuve de paiement</h2>
                      <p className="text-neutral-400 mt-1">
                        Téléchargez une capture d'écran ou photo de votre reçu
                      </p>
                    </div>

                    <div className="space-y-4">
                      {!proofFile ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-8">
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <div className="text-lg font-medium text-white mb-2">
                              Télécharger votre preuve
                            </div>
                            <p className="text-neutral-400 mb-4">
                              JPG, PNG, GIF ou PDF (max. 5MB)
                            </p>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button asChild>
                              <label htmlFor="file-upload" className="cursor-pointer">
                                Choisir un fichier
                              </label>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-white/10 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <FileImage className="w-8 h-8 text-primary" />
                            <div className="flex-1">
                              <div className="font-medium text-white">{proofFile.name}</div>
                              <div className="text-sm text-neutral-400">
                                {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProofFile(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-green-300">
                            <p className="font-medium">Votre paiement sera vérifié dans les 24h</p>
                            <p className="mt-1 opacity-90">
                              Vous recevrez une notification par email une fois le paiement confirmé.
                              Vos produits seront alors disponibles dans votre compte.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(3)} className="flex-1" disabled={!!orderCode}>
                        Retour
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!proofFile || isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                            Envoi en cours...
                          </>
                        ) : (
                          'Finaliser le paiement'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
