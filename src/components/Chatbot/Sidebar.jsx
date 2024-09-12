import NavItem from "./NavItem";

const Sidebar = ({ chats, chatId, openChat, newChat, drawerOpen }) => (
  <aside
    className={`fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform ${
      drawerOpen ? "translate-x-0" : "-translate-x-full"
    } bg-white border-r border-gray-200 md:translate-x-0 md:block`}
  >
    <div className="overflow-y-auto py-5 px-3 h-full bg-white">
      <div>
        {chats.map((chat) => (
          <NavItem key={chat.id} active={chatId === chat.id} onClick={() => openChat(chat.id)}>
            <span className="truncate text-ellipsis">{chat.title}</span>
          </NavItem>
        ))}
      </div>
      <div className="pt-5 mt-5 space-y-2 border-t border-gray-200">
        <NavItem active={!chats.some((chat) => chat.id === chatId)} onClick={newChat}>
          <i className="bx bx-message-add bx-sm"></i>
          <span className="ml-3 truncate text-ellipsis">New chat</span>
        </NavItem>
      </div>
    </div>
  </aside>
);

export default Sidebar;
