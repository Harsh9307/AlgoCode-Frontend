import { useState, useEffect, DragEvent } from 'react';
import { useParams } from 'react-router-dom'; // Import to get dynamic id from URL
import AceEditor from 'react-ace';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import "../../imports/AceBuildImports";
import DOMPurify from 'dompurify';
import Languages from '../../constants/Languages';
import Themes from '../../constants/Themes';

type languageSupport = {
    languageName: string,
    value: string
}

type themeStyle = {
    themeName: string,
    value: string
}

function ProblemDescription() {
    const { id } = useParams<{ id: string }>();  // Fetch dynamic problem id from URL
    const [descriptionText, setDescriptionText] = useState(''); // Store problem description
    const [testCases, setTestCases] = useState(''); // Store test cases
    const sanitizedMarkdown = DOMPurify.sanitize(descriptionText); // Sanitize description
    const sanitizedTestCases = DOMPurify.sanitize(testCases); // Sanitize test cases
    console.log(sanitizedTestCases)
    const [activeTab, setActiveTab] = useState('statement');
    const [testCaseTab, setTestCaseTab] = useState('input');
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [theme, setTheme] = useState('monokai');

    // Fetch the problem details based on the dynamic ID
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:3000/api/v1/problems/${id}`)
                .then(response => {
                    const problem = response.data.data;
                    setDescriptionText(problem.description); // Use fetched description
                    setCode(problem.defaultCode || ''); // Optional: Set default code for problem
                    setTestCases(problem.testCases); // Set test cases
                })
                .catch(error => {
                    console.error('There was an error fetching the problem!', error);
                });
        }
    }, [id]); // Trigger useEffect when `id` changes

    async function handleSubmission() {
        try {
            const response = await axios.post("http://localhost:4000/api/v1/submissions", {
                code,
                language,
                userId: "1", // Example static userId
                problemId: id // Use the dynamic problem id
            });
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    const startDragging = (e: DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        e.preventDefault();
    }

    const stopDragging = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    }

    const onDrag = (e: DragEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if (newLeftWidth > 10 && newLeftWidth < 90) {
            setLeftWidth(newLeftWidth);
        }
    }

    const isActiveTab = (tabName: string) => {
        return activeTab === tabName ? 'tab tab-active' : 'tab';
    }

    const isInputTabActive = (tabName: string) => {
        return testCaseTab === tabName ? 'tab tab-active' : 'tab';
    }

    return (
        <div
            className='flex w-screen h-[calc(100vh-57px)]'
            onMouseMove={onDrag}
            onMouseUp={stopDragging}
        >
            <div className='leftPanel h-full overflow-auto' style={{ width: `${leftWidth}%` }}>
                <div role="tablist" className="tabs tabs-boxed w-3/5">
                    <a onClick={() => setActiveTab('statement')} role="tab" className={isActiveTab("statement")}>Problem Statement</a>
                    <a onClick={() => setActiveTab('editorial')} role="tab" className={isActiveTab("editorial")}>Editorial</a>
                    <a onClick={() => setActiveTab('submissions')} role="tab" className={isActiveTab("submissions")}>Submissions</a>
                </div>

                <div className='markdownViewer p-[20px] basis-1/2'>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose">
                        {sanitizedMarkdown}
                    </ReactMarkdown>
                </div>

                {/* Collapsible Test Case Section */}
                <div className="collapse bg-base-200 rounded-none mt-4">
                    <input type="checkbox" className="peer" />
                    <div className="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                        Test Cases
                    </div>
                    <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose">
                            {sanitizedTestCases}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            <div className='divider cursor-col-resize w-[5px] bg-slate-200 h-full' onMouseDown={startDragging}></div>

            <div className='rightPanel h-full overflow-auto flex flex-col' style={{ width: `${100 - leftWidth}%` }}>
                <div className='flex gap-x-1.5 justify-start items-center px-4 py-2 basis-[5%]'>
                    <div>
                        <button className="btn btn-success btn-sm" onClick={handleSubmission}>Submit</button>
                    </div>
                    <div>
                        <button className="btn btn-warning btn-sm">Run Code</button>
                    </div>
                    <div>
                        <select
                            className="select select-info w-full select-sm max-w-xs"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {Languages.map((language: languageSupport) => (
                                <option key={language.value} value={language.value}> {language.languageName} </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            className="select select-info w-full select-sm max-w-xs"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {Themes.map((theme: themeStyle) => (
                                <option key={theme.value} value={theme.value}> {theme.themeName} </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col editor-console grow-[1] ">
                    <div className='editorContainer grow-[1]'>
                        <AceEditor
                            mode={language}
                            theme={theme}
                            value={code}
                            onChange={(e: string) => setCode(e)}
                            name='codeEditor'
                            className='editor'
                            style={{ width: '100%' }}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                showLineNumbers: true,
                                fontSize: 16
                            }}
                            height='100%'
                        />
                    </div>

                    <div className="collapse bg-base-200 rounded-none">
                        <input type="checkbox" className="peer" />
                        <div className="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                            Console
                        </div>
                        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                            <div role="tablist" className="tabs tabs-boxed w-3/5 mb-4">
                                <a onClick={() => setTestCaseTab('input')} role="tab" className={isInputTabActive('input')}>Input</a>
                                <a onClick={() => setTestCaseTab('output')} role="tab" className={isInputTabActive('output')}>Output</a>
                            </div>

                            {(testCaseTab === 'input') ? <textarea rows={4} cols={70} className='bg-neutral text-white rounded-md resize-none' /> : <div className='w-12 h-8'></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProblemDescription;
