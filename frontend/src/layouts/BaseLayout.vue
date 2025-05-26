<template>
    <div class="mx-auto mt-5 flex max-w-lg flex-col items-center rounded-xl bg-white p-6 shadow-lg outline outline-black/5">
        <header>
            <slot name="header" />
        </header>
        <main>
            <slot />
        </main>
    </div>
</template>
