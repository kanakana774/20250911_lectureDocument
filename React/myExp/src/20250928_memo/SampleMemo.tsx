import React from "react";

// 子コンポーネント: ユーザーリスト表示
interface User {
  id: number;
  name: string;
}

interface UserListProps {
  users: User[];
  onSelectUser: (id: number) => void;
}

const UserList: React.FC<UserListProps> = React.memo(
  ({ users, onSelectUser }) => {
    console.log("UserListがレンダリングされました");
    return (
      <div
        style={{ border: "1px solid green", margin: "10px", padding: "10px" }}
      >
        <h3>ユーザーリスト</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name}{" "}
              <button onClick={() => onSelectUser(user.id)}>選択</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

// 親コンポーネント
const SampleMemo: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );

  // ユーザーデータをuseMemoでメモ化 (変更されない限り同じ参照を返す)
  const users: User[] = React.useMemo(
    () => [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ],
    []
  ); // 依存配列が空なので、初回レンダリング時のみ生成

  // onSelectUser関数をuseCallbackでメモ化 (参照が常に安定)
  const handleSelectUser = React.useCallback((id: number) => {
    setSelectedUserId(id);
    console.log(`ユーザーID: ${id} が選択されました`);
  }, []); // 依存配列が空なので、初回レンダリング時のみ生成

  return (
    <div>
      <h1>Appコンポーネントのカウンター: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Appカウンターアップ</button>

      {selectedUserId && <p>選択されたユーザーID: {selectedUserId}</p>}

      {/* usersとhandleSelectUserはメモ化されているため、
          Appのcountが変更されてもUserListは再レンダリングされない */}
      <UserList users={users} onSelectUser={handleSelectUser} />
    </div>
  );
};

export default SampleMemo;
