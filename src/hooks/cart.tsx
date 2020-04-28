import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const newProduct = {
        ...product,
        quantity: 1,
      };
      const newProducts = [...products, newProduct];
      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cart = [...products];

      const productIndex = cart.findIndex(product => product.id === id);

      if (productIndex !== -1) {
        cart[productIndex].quantity += 1;

        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let cart = [...products];

      const productIndex = cart.findIndex(product => product.id === id);

      if (productIndex !== -1) {
        if (cart[productIndex].quantity === 1) {
          cart = cart.filter(product => product.id !== id);
        } else {
          cart[productIndex].quantity -= 1;
        }
      }

      setProducts(cart);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
