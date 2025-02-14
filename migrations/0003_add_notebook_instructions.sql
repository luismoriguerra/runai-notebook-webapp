-- Migration number: 0003 	 2025-02-14T02:33:43.790Z
alter table notebooks add column instructions TEXT DEFAULT null;