# StrategyFlow AI 🚀

An agentic SWOT analysis and product roadmap generator powered by Google Gemini 3 Pro. This application uses deep reasoning to research companies in real-time and synthesize actionable strategic roadmaps.

## 🛠 Features

- **Deep Intelligence**: Real-time market scanning via Google Search grounding.
- **Strategic Analysis**: Synthesis of high-fidelity SWOT matrices.
- **Interactive Roadmap**: A visual matrix view of product initiatives across 4 quarters.
- **Export Capabilities**: Save roadmaps as professional CSV files or branded PDFs.
- **Deep Thinking**: Leverages Gemini 3 Pro's thinking mode for complex strategic logic.

## 💻 Local Installation

Follow these steps to get the project running on your local machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/strategyflow-ai.git
cd strategyflow-ai
```

### 3. Install Dependencies
Since the app uses React and the Google GenAI SDK:
```bash
npm install
```
*Note: If you don't have a package.json yet, you can initialize one and install: `@google/genai react react-dom marked`*

### 4. Environment Setup
Create a `.env` file in the root directory:
```bash
touch .env
```
Add your Google Gemini API Key to the `.env` file:
```env
API_KEY=your_gemini_api_key_here
```

### 5. Running the App
Use a local development server (like [Vite](https://vitejs.dev/) or [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)):
```bash
# If using Vite
npm run dev
```

## 📤 Pushing to Git

To push your changes to a remote repository:

### 1. Initialize Git
```bash
git init
```

### 2. Add a .gitignore
Ensure your API key is not pushed to public repositories:
```bash
echo "node_modules\n.env\n.DS_Store\ndist" > .gitignore
```

### 3. Commit Changes
```bash
git add .
git commit -m "Initial commit: StrategyFlow AI strategic agent"
```

### 4. Push to GitHub
```bash
git remote add origin https://github.com/your-username/strategyflow-ai.git
git branch -M main
git push -u origin main
```

## 📄 License
This project is licensed under the MIT License.
