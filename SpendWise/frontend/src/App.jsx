
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Receipt, ChartPie, Tags, Plus,
  Search, Wallet, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Pencil, Trash2,
  X, Menu, CalendarDays
} from "lucide-react";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import {
  getTransactions, addTransaction,
  updateTransaction, deleteTransaction
} from "./services/api";
import Auth from "./pages/Auth";
import "./App.css";

const categories = [
  "Food", "Travel", "Shopping", "Education",
  "Entertainment", "Bills", "Allowance",
  "Salary", "Freelancing", "Other"
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const emptyForm = {
  title: "",
  amount: "",
  type: "Expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  description: ""
};

function App() {
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("spendwise_token")
);

const [currentUser, setCurrentUser] = useState(() => {
    try {
        return JSON.parse(localStorage.getItem("spendwise_user")) || null;
    } catch {
        return null;
    }
});

const handleLogin = (data) => {
    localStorage.setItem("spendwise_token", data.token);
    localStorage.setItem("spendwise_user", JSON.stringify(data.user));

    setAuthToken(data.token);
    setCurrentUser(data.user);
};

const handleLogout = () => {
    localStorage.removeItem("spendwise_token");
    localStorage.removeItem("spendwise_user");

    setAuthToken(null);
    setCurrentUser(null);
    setTransactions([]);
    setError("");
    setNotice("");
    setLoading(false);
};
  const [transactions, setTransactions] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions({
        search,
        category,
        type,
        sortBy,
        order,
        page: 1,
        limit: 100
      });

      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (!authToken) {
        setTransactions([]);
        setLoading(false);
        return;
    }

    loadTransactions();
}, [search, category, type, sortBy, order, authToken]);
  const income = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const categoryData = useMemo(() => {
    const totals = {};

    transactions
      .filter(t => t.type === "Expense")
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit"
      });

      if (!months[key]) {
        months[key] = { month: key, Income: 0, Expenses: 0 };
      }

      months[key][t.type === "Income" ? "Income" : "Expenses"] +=
        Number(t.amount);
    });

    return Object.values(months).reverse().slice(-6);
  }, [transactions]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().slice(0, 10),
      description: transaction.description || ""
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        amount: Number(form.amount)
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
        setNotice("Transaction updated successfully");
      } else {
        await addTransaction(payload);
        setNotice("Transaction added successfully");
      }

      setModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadTransactions();
    } catch (err) {
      setNotice(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      await deleteTransaction(id);
      setNotice("Transaction deleted successfully");
      await loadTransactions();
    } catch (err) {
      setNotice(err.message || "Delete failed");
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Transactions", icon: Receipt },
    { name: "Analytics", icon: ChartPie },
    { name: "Categories", icon: Tags }
  ];

  const pageTitle = {
    Dashboard: "Overview",
    Transactions: "Transactions",
    Analytics: "Analytics",
    Categories: "Categories"
  };
  if (!authToken) {
    return <Auth onLogin={handleLogin} />;
}

  return (
    <div className="app-shell">

      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Wallet size={21} /></div>
          <span>SpendWise</span>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={19}/>
          </button>
        </div>
        <div className="user-profile">
    <div className="user-avatar">
        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
    </div>

    <div className="user-info">
        <strong>{currentUser?.name || "User"}</strong>
        <span>{currentUser?.email}</span>
    </div>

    <button onClick={handleLogout} title="Logout">
        Logout
    </button>
</div>

        <p className="nav-label">MENU</p>

        <nav>
          {navItems.map(item => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => {
                setActivePage(item.name);
                setMobileMenu(false);
              }}
            >
              <item.icon size={19}/>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Wallet size={20}/>
            <p>Manage your money smarter.</p>
          </div>
          <span>SpendWise v1.0</span>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileMenu(true)}>
              <Menu/>
            </button>
            <div>
              <h1>{pageTitle[activePage]}</h1>
              <p>Welcome to your personal finance dashboard.</p>
            </div>
          </div>

          <button className="primary-btn" onClick={openAdd}>
            <Plus size={18}/> Add Transaction
          </button>
        </header>

        {notice && (
          <div className="notice">
            {notice}
            <button onClick={() => setNotice("")}><X size={16}/></button>
          </div>
        )}

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadTransactions}>Retry</button>
          </div>
        )}

        {activePage === "Dashboard" && (
          <>
            <section className="stats-grid">
              <StatCard
                title="Total Balance"
                amount={money(balance)}
                icon={<Wallet/>}
                color="blue"
                subtitle="Income minus expenses"
              />
              <StatCard
                title="Total Income"
                amount={money(income)}
                icon={<TrendingUp/>}
                color="green"
                subtitle="Recorded income"
              />
              <StatCard
                title="Total Expenses"
                amount={money(expenses)}
                icon={<TrendingDown/>}
                color="red"
                subtitle="Recorded expenses"
              />
              <StatCard
                title="Transactions"
                amount={transactions.length}
                icon={<Receipt/>}
                color="purple"
                subtitle="Loaded records"
              />
            </section>

            <section className="dashboard-grid">
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Financial Overview</h2>
                    <p>Income vs expenses</p>
                  </div>
                  <CalendarDays size={19}/>
                </div>

                <div className="chart-area">
                  {monthlyData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" axisLine={false} tickLine={false}/>
                        <YAxis axisLine={false} tickLine={false}/>
                        <Tooltip formatter={value => money(value)}/>
                        <Bar dataKey="Income" fill="#269B70" radius={[4,4,0,0]}/>
                        <Bar dataKey="Expenses" fill="#E36C6C" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyState message="Add transactions to see your financial overview."/>}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Expense Breakdown</h2>
                    <p>By category</p>
                  </div>
                  <ChartPie size={19}/>
                </div>

                <div className="pie-area">
                  {categoryData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value"
                          nameKey="name" innerRadius={58} outerRadius={88}
                          paddingAngle={3}>
                          {categoryData.map((entry, index) => (
                            <Cell key={entry.name}
                              fill={["#4385D5","#269B70","#E6A04A","#8C75C7","#E36C6C","#69A6AD"][index % 6]}/>
                          ))}
                        </Pie>
                        <Tooltip formatter={value => money(value)}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyState message="No expense data yet."/>}
                </div>

                <div className="category-legend">
                  {categoryData.map((item, index) => (
                    <div key={item.name}>
                      <span>{item.name}</span>
                      <strong>{money(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Your latest financial activity</p>
                </div>
                <button className="text-btn" onClick={() => setActivePage("Transactions")}>
                  View all <ArrowUpRight size={16}/>
                </button>
              </div>

              {loading ? <p className="loading">Loading transactions...</p> :
                <TransactionList
                  items={transactions.slice(0, 5)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              }
            </section>
          </>
        )}

        {activePage === "Transactions" && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>All Transactions</h2>
                <p>Manage your income and expenses</p>
              </div>
              <span className="record-count">{transactions.length} records loaded</span>
            </div>

            <div className="filters">
              <div className="search-box">
                <Search size={17}/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search transactions..."/>
              </div>

              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>

              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>

              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>

              <select value={order} onChange={e => setOrder(e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {loading ? <p className="loading">Loading...</p> :
              <TransactionList
                items={transactions}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            }
          </section>
        )}

        {activePage === "Analytics" && (
          <>
            <section className="stats-grid">
              <StatCard title="Income" amount={money(income)}
                icon={<TrendingUp/>} color="green"/>
              <StatCard title="Expenses" amount={money(expenses)}
                icon={<TrendingDown/>} color="red"/>
              <StatCard title="Net Savings" amount={money(balance)}
                icon={<Wallet/>} color="blue"/>
            </section>

            <section className="dashboard-grid">
              <div className="panel chart-panel">
                <div className="panel-heading">
                  <div><h2>Monthly Comparison</h2><p>Income and expenses</p></div>
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                      <XAxis dataKey="month"/>
                      <YAxis/>
                      <Tooltip formatter={value => money(value)}/>
                      <Bar dataKey="Income" fill="#269B70"/>
                      <Bar dataKey="Expenses" fill="#E36C6C"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div><h2>Category Analysis</h2><p>Expense distribution</p></div>
                </div>
                <div className="pie-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name"
                        innerRadius={55} outerRadius={85}>
                        {categoryData.map((item, index) => (
                          <Cell key={item.name}
                            fill={["#4385D5","#269B70","#E6A04A","#8C75C7","#E36C6C"][index % 5]}/>
                        ))}
                      </Pie>
                      <Tooltip formatter={value => money(value)}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="category-legend">
                  {categoryData.map(item => (
                    <div key={item.name}>
                      <span>{item.name}</span><strong>{money(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === "Categories" && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Transaction Categories</h2>
                <p>Category-wise spending summary</p>
              </div>
            </div>
            <div className="category-grid">
              {categories.map(cat => {
                const total = transactions
                  .filter(t => t.category === cat && t.type === "Expense")
                  .reduce((sum, t) => sum + Number(t.amount), 0);

                return (
                  <button className="category-card" key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setActivePage("Transactions");
                    }}>
                    <Tags size={20}/>
                    <strong>{cat}</strong>
                    <span>{money(total)} spent</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <footer className="footer">
          SpendWise © 2026 · Personal Finance Tracker
        </footer>
      </main>

      {modal && (
        <div className="modal-overlay" onMouseDown={e => {
          if (e.target === e.currentTarget) setModal(false);
        }}>
          <form className="transaction-modal" onSubmit={handleSave}>
            <div className="modal-heading">
              <div>
                <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
                <p>Enter your transaction details</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setModal(false)}>
                <X/>
              </button>
            </div>

            <label>Transaction Title</label>
            <input required minLength="2" maxLength="50"
              placeholder="e.g. Grocery Shopping"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}/>

            <label>Amount (₹)</label>
            <input required type="number" min="0.01" step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}/>

            <label>Transaction Type</label>
            <select value={form.type}
              onChange={e => setForm({...form, type: e.target.value,
                category: e.target.value === "Income" ? "Allowance" : "Food"})}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>

            <label>Category</label>
            <select value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}>
              {categories
                .filter(c => form.type === "Expense"
                  ? !["Allowance","Salary","Freelancing"].includes(c)
                  : ["Allowance","Salary","Freelancing","Other"].includes(c))
                .map(c => <option key={c}>{c}</option>)}
            </select>

            <label>Date</label>
            <input type="date" required value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}/>

            <label>Description (Optional)</label>
            <textarea maxLength="200" rows="3"
              placeholder="Add some details..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}/>

            <div className="modal-actions">
              <button type="button" className="secondary-btn"
                onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, amount, icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      <h2>{amount}</h2>
      <p>{subtitle || "Financial summary"}</p>
    </div>
  );
}

function TransactionList({ items, onEdit, onDelete }) {
  if (!items.length) {
    return <EmptyState message="No transactions found. Add your first transaction to get started."/>;
  }

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t._id}>
              <td>
                <strong>{t.title}</strong>
                <small>{t.description || "No description"}</small>
              </td>
              <td>{t.category}</td>
              <td>{new Date(t.date).toLocaleDateString("en-IN")}</td>
              <td className={t.type === "Income" ? "income-text" : "expense-text"}>
                {t.type === "Income" ? "+" : "-"}{money(t.amount)}
              </td>
              <td>
                <span className={`type-pill ${t.type.toLowerCase()}`}>
                  {t.type}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button title="Edit" onClick={() => onEdit(t)}><Pencil size={16}/></button>
                  <button title="Delete" onClick={() => onDelete(t._id)}><Trash2 size={16}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <Receipt size={28}/>
      <p>{message}</p>
    </div>
  );
}

export default App;
