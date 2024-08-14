"use client";
import React from "react";
import qs from "query-string";
import { useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Search = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const onSearchHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search) return;

    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: { term: search },
      },
      { skipEmptyString: true }
    );
    router.push(url);
    setSearch("");
  };
  const onClear = () => {
    setSearch("");
  };
  return (
    <form
      onSubmit={onSearchHandler}
      className="relative w-full lg:w-[400px] flex items-center"
    >
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        className="rounded-r-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      />
      {search && (
        <X
          className="absolute top-2.5 right-14  h-5 w-5 text-muted-foreground cursor-pointer hover:opacity-75 transition"
          onClick={onClear}
        />
      )}
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="rounded-l-none"
      >
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </Button>
    </form>
  );
};

export default Search;
