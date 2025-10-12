import React from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  products: Product[];
}

const Cart: React.FC<CartProps> = ({ products }) => {
  console.log("Cartがレンダリングされました");

  // useMemoを使って合計金額をメモ化
  const totalAmount = React.useMemo(() => {
    console.log("合計金額を計算中...");
    return products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  }, [products]); // productsが変更されたときのみ再計算

  return (
    <div>
      <h2>ショッピングカート</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.quantity}個 x {product.price}円
          </li>
        ))}
      </ul>
      <h3>合計金額: {totalAmount}円</h3>
    </div>
  );
};

const UseMemo1: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState<Product[]>([
    { id: 1, name: "りんご", price: 100, quantity: 2 },
    { id: 2, name: "バナナ", price: 150, quantity: 3 },
  ]);

  // 新しい商品をカートに追加する関数 (参照は常に同じになるようにuseCallbackでメモ化すると良い)
  const addProduct = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: prevItems.length + 1,
        name: `商品${prevItems.length + 1}`,
        price: 50 * (prevItems.length + 1),
        quantity: 1,
      },
    ]);
  };

  return (
    <div>
      <h1>カウント: {count}</h1>
      <button onClick={() => setCount(count + 1)}>カウントアップ</button>
      <button onClick={addProduct}>商品を追加</button>
      <Cart products={items} />
    </div>
  );
};

export default UseMemo1;
