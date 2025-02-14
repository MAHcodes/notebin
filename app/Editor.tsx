import { LANGUAGES, VALIDATION } from "./utils/constants";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import TextInput from "./TextInput";
import Button from "./Button";
import { Fragment, useRef, useState } from "react";
import { AiFillEdit, AiFillEye } from "react-icons/ai";
import { RiLayoutColumnFill } from "react-icons/ri";
import { BsFillTagFill } from "react-icons/bs";
import CreatePostButton from "./CreatePostButton";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: true }
);

const Editor = ({
  filetype,
  setFiletype,
  text,
  setText,
  title,
  setTitle,
  tagsList,
  setTagsList,
  tagInputValue,
  setTagInputValue,
}: any) => {
  const [tagsInputError, setTagsInputError] = useState("");
  const [mdPreviewMode, setMdPreviewMode] = useState<
    "off" | "preview" | "split"
  >("off");

  const [titleFocused, setTitleFocused] = useState(false);
  const [textFocused, setTextFocused] = useState(false);

  const [titleValid, setTitleValid] = useState(true);
  const [textValid, setTextValid] = useState(true);

  const previewRef = useRef(null);

  const handleSetTagsList = (list: string[]) => {
    if (list.length > 5) {
      setTagsInputError("You can only have up to 5 tags");
      return;
    }
    setTagsInputError("");
    setTagsList(list);
  };

  const validateTagsInputKeyDown = (event: any) => {
    const TAG_KEYS = ["Enter", ",", " "];
    if (TAG_KEYS.some((key) => key === event.key)) {
      event.preventDefault();
      if (tagInputValue) {
        if (tagsList.length < 5) {
          setTagsList(Array.from(new Set([...tagsList, tagInputValue])));
          setTagInputValue("");
        } else {
          setTagsInputError("You can only have up to 5 tags");
        }
      }
    }
  };

  const setupMarkdown = (text: string) => {
    const md = require("markdown-it")();
    const result = md.render(text);
    return result;
  };

  const scrollView = (e: any) => {
    /* @ts-ignore */
    previewRef.current?.scrollTo(
      0,
      (e.target.scrollTop / e.target.scrollTopMax) *
        /* @ts-ignore */
        previewRef.current.scrollTopMax
    );
  };

  const handleTitleFocus = () => {
    setTitleFocused(true);
  };

  const handleTextFocus = () => {
    setTextFocused(true);
  };

  const onPostSubmit = (validations: { title: boolean; text: boolean }) => {
    setTitleValid(validations.title);
    setTextValid(validations.text);
  };

  return (
    <div>
      <div className="rounded-md border-2 border-secondary">
        <div className="bg-secondary p-2 flex items-center justify-between">
          <div className="flex gap-2">
            <input
              className="bg-primary text-accent border-0 outline-0 focus:ring-0 text-sm rounded-md"
              type="text"
              list="filetypes"
              placeholder="filetype"
              value={filetype}
              onChange={(e) => setFiletype(e.target.value)}
            />
            <datalist id="filetypes">
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </datalist>
            {filetype === "markdown" && (
              <Fragment>
                <Button
                  color="zincDark"
                  variant="ghost"
                  className="hover:text-accent"
                  title={mdPreviewMode === "off" ? "Preview" : "Edit"}
                  onClick={() =>
                    setMdPreviewMode(
                      mdPreviewMode === "preview" ? "off" : "preview"
                    )
                  }
                  icon={
                    mdPreviewMode === "preview" ? <AiFillEdit /> : <AiFillEye />
                  }
                />
                <Button
                  color="zincDark"
                  variant="ghost"
                  title="Split Preview"
                  className="hover:text-accent"
                  onClick={() =>
                    setMdPreviewMode(
                      mdPreviewMode === "split" ? "off" : "split"
                    )
                  }
                  icon={
                    <RiLayoutColumnFill
                      className={
                        mdPreviewMode === "split"
                          ? "rotate-[270deg] md:rotate-0"
                          : "rotate-90 md:rotate-180"
                      }
                    />
                  }
                />
              </Fragment>
            )}
          </div>
        </div>
        <div className="flex h-[36rem] flex-col md:flex-row">
          {(filetype !== "markdown" || mdPreviewMode !== "preview") && (
            <div
              className="flex flex-col w-full h-full overflow-auto"
              onScroll={scrollView}
            >
              <div className="flex flex-col grow overflow-auto">
                <div>
                  <textarea
                    title={title}
                    required
                    rows={1}
                    className="text-zinc-100 bg-primary border-none focus:border-none resize-none font-medium text-2xl px-6 pt-6 pb-0 w-full focus:ring-0"
                    value={title}
                    placeholder="Title..."
                    onChange={(evn) => {
                      setTitle(evn.target.value);
                      setTitleValid(true);
                    }}
                    onBlur={handleTitleFocus}
                    /* @ts-ignore */
                    titlefocused={titleFocused.toString()}
                    titlevalid={titleValid.toString()}
                  />
                  <span className="px-6 pt-0.5 text-xs text-red-500 hidden">
                    {VALIDATION.required}
                  </span>
                </div>
                <div className="flex flex-col grow">
                  <CodeEditor
                    required
                    className="w-full focus:border focus:border-blue-500 p-3 outline-none min-h-full"
                    value={text}
                    language={filetype}
                    placeholder="Enter your note..."
                    autoCapitalize="none"
                    onChange={(evn) => {
                      setText(evn.target.value);
                      setTextValid(true);
                    }}
                    onBlur={handleTextFocus}
                    /* @ts-ignore */
                    textfocused={textFocused.toString()}
                    textvalid={textValid.toString()}
                    padding={24}
                    style={{
                      color: "#c9d1d9",
                      fontSize: 15,
                    }}
                  />
                  <span className="px-6 pt-0.5 pb-6 text-xs text-red-500 hidden">
                    {VALIDATION.required}
                  </span>
                </div>
              </div>
            </div>
          )}
          {filetype === "markdown" && mdPreviewMode !== "off" && (
            <div
              ref={previewRef}
              className={`w-full h-full overflow-auto prose prose-zinc dark:prose-invert
                ${
                  mdPreviewMode === "preview"
                    ? "min-w-full"
                    : mdPreviewMode === "split"
                    ? "border-t-2 md:border-l-2 md:border-t-0 border-secondary"
                    : ""
                }`}
            >
              <h1
                className="text-zinc-100 text-2xl font-medium mb-0 px-6 pt-6"
                style={{ paddingBottom: "0.375rem" }}
              >
                {title}
              </h1>
              <div
                className="md-preview-note-wrapper"
                style={{ color: "#c9d1d9" }}
                dangerouslySetInnerHTML={{ __html: setupMarkdown(text) }}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-b-md border-x-2 border-b-2 border-secondary p-1 pt-2 -mt-1 flex items-center justify-between gap-4">
        <TextInput
          icon={<BsFillTagFill className="w-4 h-4" />}
          placeholder={"Enter tags"}
          tagsList={tagsList}
          setTagsList={handleSetTagsList}
          value={tagInputValue}
          error={tagsInputError}
          onKeyDown={validateTagsInputKeyDown}
          onChange={(e) => setTagInputValue(e.target.value)}
        />
        <CreatePostButton
          filetype={filetype}
          text={text}
          title={title}
          tagsList={tagsList}
          onSubmit={onPostSubmit}
        />
      </div>
    </div>
  );
};

export default Editor;
