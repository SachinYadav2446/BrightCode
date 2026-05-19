import re

with open("client/src/pages/Arcade.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Extract the modal grid contents
grid_match = re.search(r'(<div className="curr-modal-grid">.*?)<!-- Right Side: Dynamic Interactive Study Hub', code, re.DOTALL)
if not grid_match:
    print("Could not find curr-modal-grid")
    exit(1)

left_side = grid_match.group(1)

right_side_match = re.search(r'(<!-- Right Side: Dynamic Interactive Study Hub.*?</div>\n                                </div>)', code, re.DOTALL)
if not right_side_match:
    print("Could not find right side")
    exit(1)

right_side = right_side_match.group(1)

modal_grid = left_side + right_side

# 2. Extract curriculum dashboard
dash_match = re.search(r'(<motion\.div\s+key="curriculum-dashboard".*?</div>\n                        </motion\.div>)', code, re.DOTALL)
if not dash_match:
    print("Could not find curriculum dashboard")
    exit(1)

dashboard = dash_match.group(1)

# 3. Create the new curriculum view logic
new_curriculum_logic = f"""{{activeTab === 'curriculum' ? (
                        activeSubjModal ? (
                            <motion.div
                                key="curriculum-subject-view"
                                initial={{{{ opacity: 0, x: 20 }}}}
                                animate={{{{ opacity: 1, x: 0 }}}}
                                exit={{{{ opacity: 0, x: -20 }}}}
                                transition={{{{ duration: 0.3 }}}}
                                className="curr-subject-page-container"
                            >
                                <button className="curr-back-btn" onClick={{() => {{
                                    setActiveSubjModal(null);
                                    setEthicalChoice(null);
                                    setGenAiResponse('');
                                    setMlResult(null);
                                    setArchLogs([]);
                                }}}}>
                                    <ArrowLeft size={{16}} /> Back to Curriculum Track
                                </button>
                                {modal_grid}
                            </motion.div>
                        ) : (
                            {dashboard}
                        )
                    ) :"""

# Replace the old {activeTab === 'curriculum' ? ... }
code = re.sub(r"\{activeTab === 'curriculum' \? \(\n\s*<motion\.div\s+key=\"curriculum-dashboard\".*?</motion\.div>\n\s*\) :", new_curriculum_logic, code, flags=re.DOTALL)

# 4. Remove the modal overlay at the bottom
code = re.sub(r"\{\/\* Immersive Subject Modal \*\/\}.*?</AnimatePresence>", "", code, flags=re.DOTALL)

with open("client/src/pages/Arcade.jsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Replaced successfully!")
