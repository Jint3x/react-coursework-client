import { useState, useEffect, useMemo } from 'react';
import styles from '../styles/newExperience.module.css';
import getAccountCookie from './getAccountCookie';
import { useRouter } from 'next/navigation';

const generateId = () => crypto.randomUUID();

const CATEGORIES = [
  "Food & Drink",
  "Activities & Hobbies",
  "Travel & Places",
  "Skills & Learning",
  "Media",
  "Personal Growth",
  "Other"
];

const initialItemFormState = {
  text: '',
  category: CATEGORIES[0]
};

const initialExperienceFormState = {
  dateTried: '',
  notes: ''
};

export default function NewExperience({children}) {
    const router = useRouter()
    const [items, setItems] = useState([]);
    const [itemFormData, setItemFormData] = useState(initialItemFormState);
    
    const [editingExperienceId, setEditingExperienceId] = useState(null);
    const [experienceFormData, setExperienceFormData] = useState(initialExperienceFormState);

    const [filterCategory, setFilterCategory] = useState("All");
    const [itemFormError, setItemFormError] = useState("");
    const [experienceFormError, setExperienceFormError] = useState("");

    const [showAddItemForm, setShowAddItemForm] = useState(false);

    useEffect(() => {
        const session = getAccountCookie()
        if (session === undefined) {
        router.push("/login")
        }

        fetch(`http://localhost:8000/api/experiences?session=${session}`)
        .then(res => res.json())
        .then(res => {
            if (res.code === 0) {
                setItems(res.data.experiences ?? [])
            } else {
                setItems([])
            }
        })
    }, []);


    const handleItemInputChange = (event) => {
        const { name, value } = event.target;
        setItemFormData(prev => ({ ...prev, [name]: value }));
        if (itemFormError) setItemFormError("");
    };

    const handleExperienceInputChange = (event) => {
        const { name, value } = event.target;
        setExperienceFormData(prev => ({ ...prev, [name]: value }));
        if (experienceFormError) setExperienceFormError("");
    };

    const validateItemForm = () => {
        if (!itemFormData.text.trim()) return "The 'thing to try' cannot be empty.";
        if (!itemFormData.category) return "Category is required.";
        return "";
    };

    const handleAddItemSubmit = (event) => {
        event.preventDefault();

        const formError = validateItemForm();
        if (formError) {
            setItemFormError(formError);
            return;
        }

        const newItem = {
            id: generateId(),
            text: itemFormData.text.trim(),
            category: itemFormData.category,
            tried: false,
            dateTried: '',
            notes: ''
        };

        fetch("http://localhost:8000/api/experiences", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...newItem,
                user_session: getAccountCookie()
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.code === 0) {
                setItems([newItem, ...items]);
                setItemFormData(initialItemFormState);
                setItemFormError('');
                setShowAddItemForm(false);
            } else {
                // Handle error
                console.log(res)
            }
        })
    };

    const handleDeleteItem = (idToDelete) => {
        fetch("http://localhost:8000/api/experiences", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: idToDelete,
                user_session: getAccountCookie()
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.code === 0) {
                setItems(items.filter(item => item.id !== idToDelete));
                if (editingExperienceId === idToDelete) { 
                    setEditingExperienceId(null);
                    setExperienceFormData(initialExperienceFormState);
                    setExperienceFormError('');
                }
            } else {
                // Handle error
                console.log(res)
            }
        })
    };

    const handleOpenExperienceForm = (item) => {
        setEditingExperienceId(item.id);
        setExperienceFormData({
            dateTried: item.dateTried || "",
            notes: item.notes || ""
        });
        setExperienceFormError(""); 

        const element = document.getElementById(`experience-form-${item.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleCloseExperienceForm = () => {
        setEditingExperienceId(null);
        setExperienceFormData(initialExperienceFormState);
        setExperienceFormError("");
    };
  
    const validateExperienceForm = () => {
        if (!experienceFormData.dateTried.trim()) return "Date tried cannot be empty.";
        return "";
    };

    const handleSubmitExperience = (itemId) => {
        const formError = validateExperienceForm();
        if (formError) {
            setExperienceFormError(formError);
            return;
        }

        fetch("http://localhost:8000/api/experiences", {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: itemId,
                tried: true,
                dateTried: experienceFormData.dateTried.trim(),
                notes: experienceFormData.notes.trim(),
                user_session: getAccountCookie()
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.code === 0) {
                setItems(items.map(item =>
                    item.id === itemId
                        ? { ...item, tried: true, dateTried: experienceFormData.dateTried.trim(), notes: experienceFormData.notes.trim() }
                        : item
                ));
                handleCloseExperienceForm();
            } else {
                // Handle error
                console.log(res)
            }
        })
    };

    const handleMarkAsNotTried = (itemId) => {
        fetch("http://localhost:8000/api/experiences", {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: itemId,
                tried: false,
                dateTried: "",
                notes: "",
                user_session: getAccountCookie()
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.code === 0) {
                setItems(items.map(item =>
                    item.id === itemId
                    ? { ...item, tried: false, dateTried: '', notes: '' }
                    : item
                ));

                if (editingExperienceId === itemId) { 
                    handleCloseExperienceForm();
                }
            } else {
                // Handle error
                console.log(res)
            }
        })
    };

    const filteredItems = useMemo(() => {
        if (filterCategory === "All") {
            return items;
        }

        return items.filter(item => item.category === filterCategory);
    }, [items, filterCategory]);

    const toggleAddItemForm = () => {
        setShowAddItemForm(!showAddItemForm);
        
        if (!showAddItemForm) { 
            setItemFormData(initialItemFormState);
            setItemFormError('');
        }
    };

    return (
        <div className={styles.app_container}>
            {children}

        <header className={styles.app_header}>
            <h1 className={styles.app_header__title}>Try Something New! 🚀</h1>
            <button onClick={toggleAddItemForm} className={styles.app_header__toggle_button}>
            {showAddItemForm ? 'Cancel' : '+ Add New Idea'}
            </button>
        </header>

        {showAddItemForm && (
            <div className={`${styles.form_section}`}>
            <h2 className={styles.form_section__title}>Add a New Thing to Try</h2>
            {itemFormError && <p className={styles.error_message}>{itemFormError}</p>}
            <form onSubmit={handleAddItemSubmit} className={styles.item_form}>
                <div className={styles.form_group}>
                <label htmlFor="text" className={styles.form_group__label}>What do you want to try?</label>
                <input type="text" id="text" name="text" value={itemFormData.text} onChange={handleItemInputChange} placeholder="e.g., Bake sourdough bread" className={styles.form_group__input} />
                </div>
                <div className={styles.form_group}>
                <label htmlFor="category" className={styles.form_group__label}>Category</label>
                <select id="category" name="category" value={itemFormData.category} onChange={handleItemInputChange} className={styles.form_group__select}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                </div>
                <button type="submit" className={styles.submit_button}>Add Idea</button>
            </form>
            </div>
        )}

        <div className={styles.filter_section}>
            <div className={styles.form_group}>
            <label htmlFor="filterCategory" className={styles.form_group__label}>Filter by Category:</label>
            <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={styles.form_group__select}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            </div>
        </div>

        <div className={styles.list_section}>
            <h2 className={styles.list_section__title}>Your Challenge List ({filteredItems.length})</h2>
            {filteredItems.length === 0 ? (
            <p className={styles.list_section__no_items_message}>
                {filterCategory === "All" && items.length === 0 
                ? "No ideas added yet. Click '+ Add New Idea' to start!"
                : `No ideas found for category: ${filterCategory}.`}
            </p>
            ) : (
            <div className={styles.list_section__challenge_list}>
                {filteredItems.map(item => (
                <div key={item.id} className={`${styles.challenge_card} ${item.tried ? styles.challenge_card__tried : styles.challenge_card__not_tried}`}>
                    <div className={styles.challenge_card__main_info}>
                        <div className={styles.challenge_card__header}>
                            <h3 className={styles.challenge_card__title_text}>{item.text}</h3>
                            <span className={styles.challenge_card__category_badge}>{item.category}</span>
                        </div>
                        {item.tried && (
                            <div className={styles.challenge_card__experience_details}>
                            <p><strong>Tried on:</strong> {item.dateTried}</p>
                            {item.notes && <p><strong>Notes:</strong> <em>{item.notes}</em></p>}
                            </div>
                        )}
                    </div>
                    
                    {editingExperienceId === item.id ? (
                    <div className={styles.challenge_card__experience_form} id={`experience-form-${item.id}`}>
                        <h4 className={styles.challenge_card__experience_form_title}>{item.tried ? 'Edit Experience' : 'Log Your Experience!'}</h4>
                        {experienceFormError && <p className={`${styles.error_message} ${styles.error_message__small}`}>{experienceFormError}</p>}
                        <div className={styles.form_group}>
                        <label htmlFor={`dateTried-${item.id}`} className={styles.form_group__label}>Date Tried</label>
                        <input type="text" id={`dateTried-${item.id}`} name="dateTried" value={experienceFormData.dateTried} onChange={handleExperienceInputChange} placeholder="e.g., YYYY-MM-DD or 'Last Saturday'" className={styles.form_group__input} />
                        </div>
                        <div className={styles.form_group}>
                        <label htmlFor={`notes-${item.id}`} className={styles.form_group__label}>Notes/Thoughts</label>
                        <textarea id={`notes-${item.id}`} name="notes" value={experienceFormData.notes} onChange={handleExperienceInputChange} placeholder="How was it?" className={styles.form_group__textarea} />
                        </div>
                        <div className={styles.challenge_card__experience_form_actions}>
                            <button onClick={() => handleSubmitExperience(item.id)} className={`${styles.action_button} ${styles.action_button__submit_experience}`}>Save Experience</button>
                            <button onClick={handleCloseExperienceForm} className={`${styles.action_button} ${styles.action_button__cancel_experience}`}>Cancel</button>
                        </div>
                    </div>
                    ) : (
                    <div className={styles.challenge_card__actions}>
                        {!item.tried && (
                        <button onClick={() => handleOpenExperienceForm(item)} className={`${styles.action_button} ${styles.action_button__mark_tried}`}>Mark as Tried</button>
                        )}
                        {item.tried && (
                        <>
                            <button onClick={() => handleOpenExperienceForm(item)} className={`${styles.action_button} ${styles.action_button__edit_experience}`}>Edit Experience</button>
                            <button onClick={() => handleMarkAsNotTried(item.id)} className={`${styles.action_button} ${styles.action_button__not_tried}`}>Mark Not Tried</button>
                        </>
                        )}
                        <button onClick={() => handleDeleteItem(item.id)} className={`${styles.action_button} ${styles.action_button__delete_item}`}>Delete</button>
                    </div>
                    )}
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}
